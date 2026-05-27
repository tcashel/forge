/**
 * forge serve — planner chat (Phase 7) endpoint smoke tests.
 *
 * Covers the JSON-bodied / non-SSE plan-chat routes: draft mint, history
 * read, history wipe, draft promote. The actual SSE chat-turn path is
 * NOT covered here because it spawns the real `claude` binary; those
 * paths are exercised at the unit level in plan-chat.spawn.test.ts (TBD)
 * with a stub spawn implementation, and end-to-end via the manual
 * verification recipe in the Phase 7 plan.
 */

import { strict as assert } from "node:assert";
import { EventEmitter } from "node:events";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { PassThrough, Readable } from "node:stream";
import { test } from "node:test";
import { startServer } from "../src/cli/cmd/serve.ts";
import {
  BadCwdError,
  type ChatMessage as ChatMsgType,
  cleanStderrTail,
  loadHistory,
  loadSkillPrompt,
  runChatTurn,
} from "../src/core/plan-chat.ts";
import { ForgeStore, type Plan } from "../src/core/store.ts";

interface ServerHandle {
  baseUrl: string;
  stop: () => void;
  store: ForgeStore;
  tmpHome: string;
  forgeDir: string;
}

async function bootServer(): Promise<ServerHandle> {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "forge-plan-chat-"));
  const forgeDir = path.join(tmpHome, ".forge");
  try {
    const store = new ForgeStore({ forgeDir });
    const { port, stop } = await startServer(store, { port: 0, host: "127.0.0.1" });
    return {
      baseUrl: `http://127.0.0.1:${port}`,
      store,
      tmpHome,
      forgeDir,
      stop: () => {
        stop();
        fs.rmSync(tmpHome, { recursive: true, force: true });
      },
    };
  } catch (e) {
    fs.rmSync(tmpHome, { recursive: true, force: true });
    throw e;
  }
}

interface Envelope {
  ok: boolean;
  data?: Record<string, unknown> & { messages?: unknown[]; draftId?: string; planId?: string };
  error?: { code: string; message: string };
}

async function getJson(url: string): Promise<{ status: number; body: Envelope }> {
  const res = await fetch(url);
  const body = (await res.json()) as Envelope;
  return { status: res.status, body };
}

async function postJson(url: string, body?: unknown): Promise<{ status: number; body: Envelope }> {
  const res = await fetch(url, {
    method: "POST",
    headers: body !== undefined ? { "content-type": "application/json" } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const parsed = (await res.json()) as Envelope;
  return { status: res.status, body: parsed };
}

async function delJson(url: string): Promise<{ status: number; body: Envelope }> {
  const res = await fetch(url, { method: "DELETE" });
  const parsed = (await res.json()) as Envelope;
  return { status: res.status, body: parsed };
}

function makeDraftTask(store: ForgeStore, id: string, repoRoot: string, title: string): Plan {
  const now = new Date().toISOString();
  const specBody = `# ${title}\n\nA stub spec body for chat tests.\n`;
  const specPath = store.writeSpec(id, specBody);
  const task: Plan = {
    id,
    title,
    repoRoot,
    repoName: "demo",
    branch: `forge/${id}`,
    worktree: null,
    status: "draft",
    agent: null,
    model: null,
    createdAt: now,
    launchedAt: null,
    completedAt: null,
    prUrl: null,
    prNumber: null,
    tmuxSession: null,
    logFile: null,
    jiraTicket: null,
    specFile: specPath,
    specVersion: 1,
    lastImproveError: null,
  };
  store.upsertPlan(task);
  return task;
}

test("POST /api/plan-chat/draft mints a draftId and creates the history file", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const { status, body } = await postJson(`${h.baseUrl}/api/plan-chat/draft`);
  assert.equal(status, 200);
  assert.equal(body.ok, true);
  const draftId = body.data!.draftId as string;
  assert.match(draftId, /^d_[0-9a-f]{8}$/);
  // Folder + history.json should exist on disk.
  const historyFile = path.join(h.forgeDir, "plan-drafts", draftId, "history.json");
  assert.equal(fs.existsSync(historyFile), true);
  const parsed = JSON.parse(fs.readFileSync(historyFile, "utf-8"));
  assert.equal(parsed.version, 1);
  assert.deepEqual(parsed.messages, []);
});

test("GET /api/plan-chat/draft/:id/history returns empty messages for fresh draft", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const created = await postJson(`${h.baseUrl}/api/plan-chat/draft`);
  const draftId = created.body.data!.draftId as string;

  const { status, body } = await getJson(`${h.baseUrl}/api/plan-chat/draft/${draftId}/history`);
  assert.equal(status, 200);
  assert.equal(body.ok, true);
  assert.deepEqual(body.data!.messages, []);
});

test("GET /api/plan-chat/draft/:id/history returns [] for unknown draft (treated as empty)", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  // We don't 404 missing history files — empty is a valid empty state.
  const { status, body } = await getJson(`${h.baseUrl}/api/plan-chat/draft/d_deadbeef/history`);
  assert.equal(status, 200);
  assert.deepEqual(body.data!.messages, []);
});

test("DELETE /api/plan-chat/draft/:id wipes the draft folder", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const created = await postJson(`${h.baseUrl}/api/plan-chat/draft`);
  const draftId = created.body.data!.draftId as string;
  const draftDir = path.join(h.forgeDir, "plan-drafts", draftId);
  assert.equal(fs.existsSync(draftDir), true);

  const { status, body } = await delJson(`${h.baseUrl}/api/plan-chat/draft/${draftId}`);
  assert.equal(status, 200);
  assert.equal(body.ok, true);
  assert.equal(fs.existsSync(draftDir), false);

  // History endpoint should still return [] even though the folder is gone.
  const after = await getJson(`${h.baseUrl}/api/plan-chat/draft/${draftId}/history`);
  assert.deepEqual(after.body.data!.messages, []);
});

test("POST /api/plan-chat/draft/:id/abort succeeds even with no in-flight subprocess", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const created = await postJson(`${h.baseUrl}/api/plan-chat/draft`);
  const draftId = created.body.data!.draftId as string;

  const { status, body } = await postJson(`${h.baseUrl}/api/plan-chat/draft/${draftId}/abort`);
  assert.equal(status, 200);
  assert.equal(body.data!.aborted, false); // nothing to kill
});

// Defense against path traversal: every draft route must reject `draftId`
// values that don't match `^d_[0-9a-f]{8}$`. Without this gate, an encoded
// `..` payload could escape the `plan-drafts` directory and hit
// `fs.rmSync(recursive: true)` on arbitrary paths under `forgeDir`.
test("draft routes reject malformed draftId with 400 BAD_DRAFT_ID", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  // Encoded `../../evil` — path.join would normalize this to escape
  // the plan-drafts directory if validation were missing.
  const evil = encodeURIComponent("../../evil");
  const cases: Array<{ method: string; url: string }> = [
    { method: "GET", url: `${h.baseUrl}/api/plan-chat/draft/${evil}/history` },
    { method: "DELETE", url: `${h.baseUrl}/api/plan-chat/draft/${evil}` },
    { method: "POST", url: `${h.baseUrl}/api/plan-chat/draft/${evil}/abort` },
    { method: "POST", url: `${h.baseUrl}/api/plan-chat/draft/${evil}/message` },
    { method: "POST", url: `${h.baseUrl}/api/plan-chat/draft/${evil}/promote` },
  ];
  for (const c of cases) {
    const res = await fetch(c.url, {
      method: c.method,
      headers: { "content-type": "application/json" },
      body: c.method === "GET" || c.method === "DELETE" ? undefined : JSON.stringify({ message: "x" }),
    });
    const body = (await res.json()) as Envelope;
    assert.equal(res.status, 400, `${c.method} ${c.url} should 400`);
    assert.equal(body.error?.code, "BAD_DRAFT_ID", `${c.method} ${c.url} should error BAD_DRAFT_ID`);
  }
});

test("GET /api/specs/:id/plan-history is empty for a fresh draft task", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  makeDraftTask(h.store, "draft-fresh", h.tmpHome, "feat(demo): fresh");
  const { status, body } = await getJson(`${h.baseUrl}/api/specs/draft-fresh/plan-history`);
  assert.equal(status, 200);
  assert.deepEqual(body.data!.messages, []);
});

test("GET /api/specs/:id/plan-history returns 404 for unknown task", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const { status, body } = await getJson(`${h.baseUrl}/api/specs/nope/plan-history`);
  assert.equal(status, 404);
  assert.equal(body.error!.code, "UNKNOWN_TASK");
});

test("DELETE /api/specs/:id/plan-history wipes the saved history", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const planId = "wipe-target";
  makeDraftTask(h.store, planId, h.tmpHome, "feat(demo): wipe");
  // Hand-write some history.
  const dir = path.join(h.forgeDir, "specs", planId);
  fs.mkdirSync(dir, { recursive: true });
  const histFile = path.join(dir, "plan-history.json");
  fs.writeFileSync(
    histFile,
    JSON.stringify({
      version: 1,
      messages: [
        { id: "m_1234abcd", role: "user", text: "hi", ts: new Date().toISOString() },
        { id: "m_5678efgh", role: "assistant", text: "hello", ts: new Date().toISOString() },
      ],
    }),
  );
  // Sanity: GET sees both messages.
  const before = await getJson(`${h.baseUrl}/api/specs/${planId}/plan-history`);
  assert.equal((before.body.data!.messages as unknown[]).length, 2);

  const { status, body } = await delJson(`${h.baseUrl}/api/specs/${planId}/plan-history`);
  assert.equal(status, 200);
  assert.equal(body.data!.ok, true);
  assert.equal(fs.existsSync(histFile), false);

  const after = await getJson(`${h.baseUrl}/api/specs/${planId}/plan-history`);
  assert.deepEqual(after.body.data!.messages, []);
});

test("POST /api/plan-chat/draft/:id/promote moves draft history into the spec dir", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const planId = "promote-target";
  makeDraftTask(h.store, planId, h.tmpHome, "feat(demo): promote");

  // Mint a draft and hand-write some history into it.
  const created = await postJson(`${h.baseUrl}/api/plan-chat/draft`);
  const draftId = created.body.data!.draftId as string;
  const draftFile = path.join(h.forgeDir, "plan-drafts", draftId, "history.json");
  const sample = {
    version: 1,
    messages: [
      { id: "m_aabbccdd", role: "user", text: "draft msg", ts: new Date().toISOString() },
      { id: "m_eeff0011", role: "assistant", text: "draft reply", ts: new Date().toISOString() },
    ],
  };
  fs.writeFileSync(draftFile, JSON.stringify(sample));

  const { status, body } = await postJson(`${h.baseUrl}/api/plan-chat/draft/${draftId}/promote`, { planId });
  assert.equal(status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.data!.planId, planId);

  // Draft folder gone, spec history file present with the original payload.
  const draftDir = path.join(h.forgeDir, "plan-drafts", draftId);
  assert.equal(fs.existsSync(draftDir), false);
  const targetFile = path.join(h.forgeDir, "specs", planId, "plan-history.json");
  assert.equal(fs.existsSync(targetFile), true);
  const moved = JSON.parse(fs.readFileSync(targetFile, "utf-8"));
  assert.deepEqual(moved.messages, sample.messages);
});

test("POST /api/plan-chat/draft/:id/promote 404s for an unknown planId", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const created = await postJson(`${h.baseUrl}/api/plan-chat/draft`);
  const draftId = created.body.data!.draftId as string;
  const { status, body } = await postJson(`${h.baseUrl}/api/plan-chat/draft/${draftId}/promote`, {
    planId: "does-not-exist",
  });
  assert.equal(status, 404);
  assert.equal(body.error!.code, "UNKNOWN_TASK");
});

test("POST /api/plan-chat/draft/:id/promote rejects when spec already has plan history", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const planId = "promote-conflict";
  makeDraftTask(h.store, planId, h.tmpHome, "feat(demo): conflict");
  // Pre-seed an existing plan-history.json on the spec.
  const dir = path.join(h.forgeDir, "specs", planId);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "plan-history.json"),
    JSON.stringify({ version: 1, messages: [{ id: "m_existing0", role: "user", text: "x", ts: "now" }] }),
  );

  const created = await postJson(`${h.baseUrl}/api/plan-chat/draft`);
  const draftId = created.body.data!.draftId as string;
  fs.writeFileSync(
    path.join(h.forgeDir, "plan-drafts", draftId, "history.json"),
    JSON.stringify({ version: 1, messages: [] }),
  );

  const { status, body } = await postJson(`${h.baseUrl}/api/plan-chat/draft/${draftId}/promote`, { planId });
  assert.equal(status, 409);
  assert.equal(body.error!.code, "PROMOTE_CONFLICT");
});

test("POST /api/specs/:id/plan-chat returns 404 for unknown planId", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const { status, body } = await postJson(`${h.baseUrl}/api/specs/nope/plan-chat`, { message: "hi" });
  assert.equal(status, 404);
  assert.equal(body.error!.code, "UNKNOWN_TASK");
});

test("POST /api/specs/:id/plan-chat rejects empty message", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  makeDraftTask(h.store, "msg-validation", h.tmpHome, "feat(demo): validation");
  const { status, body } = await postJson(`${h.baseUrl}/api/specs/msg-validation/plan-chat`, {});
  assert.equal(status, 400);
  assert.equal(body.error!.code, "BAD_REQUEST");
});

test("POST /api/plan-chat/draft/:id/message rejects unknown draftId", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  // Format-valid id (matches `^d_[0-9a-f]{8}$`) that simply has no
  // folder on disk — exercises the existence check, not the format gate.
  const { status, body } = await postJson(`${h.baseUrl}/api/plan-chat/draft/d_deadbeef/message`, { message: "hi" });
  assert.equal(status, 404);
  assert.equal(body.error!.code, "UNKNOWN_DRAFT");
});

test("POST /api/specs/:id/plan-chat/abort returns aborted: false when nothing in flight", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  makeDraftTask(h.store, "abort-noop", h.tmpHome, "feat(demo): abort");
  const { status, body } = await postJson(`${h.baseUrl}/api/specs/abort-noop/plan-chat/abort`);
  assert.equal(status, 200);
  assert.equal(body.data!.aborted, false);
});

// ─── runChatTurn cwd plumbing ───────────────────────────────────────────────
//
// These tests exercise the cwd validation + spawnImpl receiver directly,
// without booting a full HTTP server. They use a stub child that ends
// immediately with code 0 so the SSE stream completes on its own.

interface StubChildOptions {
  stdout?: string;
  stderr?: string;
  exitCode?: number | null;
  exitSignal?: NodeJS.Signals | null;
}

function makeStubChild(opts: StubChildOptions = {}): EventEmitter & {
  stdout: Readable;
  stderr: Readable;
  kill: (sig?: string) => boolean;
} {
  const emitter = new EventEmitter() as EventEmitter & {
    stdout: Readable;
    stderr: Readable;
    kill: (sig?: string) => boolean;
  };
  emitter.stdout = Readable.from(Buffer.from(opts.stdout ?? "ok\n"));
  emitter.stderr = Readable.from(Buffer.from(opts.stderr ?? ""));
  emitter.kill = () => true;
  // Defer the close event to the next tick so the consumer has time to
  // wire up its `data` / `close` handlers in the ReadableStream start().
  setImmediate(() => {
    emitter.emit("close", opts.exitCode ?? 0, opts.exitSignal ?? null);
  });
  return emitter;
}

test("runChatTurn rejects a missing cwd with BadCwdError before spawning", () => {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "forge-chat-cwd-"));
  try {
    const forgeDir = path.join(tmpHome, ".forge");
    fs.mkdirSync(forgeDir, { recursive: true });
    let spawnCalls = 0;
    assert.throws(
      () =>
        runChatTurn({
          forgeDir,
          scope: { kind: "draft", id: "d_doesntmatter" },
          message: "hello",
          cwd: path.join(tmpHome, "definitely-not-here"),
          spawnImpl: () => {
            spawnCalls++;
            // Should never be reached.
            return makeStubChild() as never;
          },
        }),
      (err: unknown) => err instanceof BadCwdError && /repo not found at /.test((err as Error).message),
    );
    assert.equal(spawnCalls, 0, "spawnImpl must not run when cwd is invalid");
  } finally {
    fs.rmSync(tmpHome, { recursive: true, force: true });
  }
});

test("runChatTurn rejects a relative cwd with BadCwdError", () => {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "forge-chat-cwd-rel-"));
  try {
    const forgeDir = path.join(tmpHome, ".forge");
    fs.mkdirSync(forgeDir, { recursive: true });
    assert.throws(
      () =>
        runChatTurn({
          forgeDir,
          scope: { kind: "draft", id: "d_rel" },
          message: "hi",
          cwd: "relative/path",
          spawnImpl: () => makeStubChild() as never,
        }),
      (err: unknown) => err instanceof BadCwdError,
    );
  } finally {
    fs.rmSync(tmpHome, { recursive: true, force: true });
  }
});

test("runChatTurn forwards a valid cwd to spawnImpl", async () => {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "forge-chat-cwd-ok-"));
  try {
    const forgeDir = path.join(tmpHome, ".forge");
    fs.mkdirSync(forgeDir, { recursive: true });
    const repoRoot = path.join(tmpHome, "fake-repo");
    fs.mkdirSync(repoRoot, { recursive: true });

    let observedCwd: string | undefined;
    const result = runChatTurn({
      forgeDir,
      scope: { kind: "draft", id: "d_okcwd001" },
      message: "ping",
      cwd: repoRoot,
      spawnImpl: (_bin, _args, cwd) => {
        observedCwd = cwd;
        return makeStubChild({ stdout: "pong\n" }) as never;
      },
    });

    // Drain the stream so the assistant message is persisted and the
    // child's close handler fires (which is where in-flight cleanup
    // happens). We don't assert on the SSE shape here — the existing
    // tests cover that path.
    const reader = result.stream.getReader();
    while (true) {
      const { done } = await reader.read();
      if (done) break;
    }

    assert.equal(observedCwd, repoRoot, "spawnImpl received the resolved cwd");
  } finally {
    fs.rmSync(tmpHome, { recursive: true, force: true });
  }
});

// Regression: model strings must be forwarded as a single argv element.
// Earlier versions built a `bash -lc` command and only escaped `"`, which
// left `$()` and backticks live — a planner request with
// `model: "x$(touch /tmp/pwn)"` would execute the substitution at chat
// turn startup. The argv-only spawn closes that hole structurally.
test("runChatTurn passes model as a single argv arg, not shell-interpolated", async () => {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "forge-chat-argv-"));
  try {
    const forgeDir = path.join(tmpHome, ".forge");
    fs.mkdirSync(forgeDir, { recursive: true });
    const repoRoot = path.join(tmpHome, "fake-repo");
    fs.mkdirSync(repoRoot, { recursive: true });

    const evilModel = "claude-opus-4-7$(touch /tmp/forge-pwn-test)";
    let observedBin = "";
    let observedArgs: string[] = [];

    const result = runChatTurn({
      forgeDir,
      scope: { kind: "draft", id: "d_argvtst" },
      message: "ping",
      cwd: repoRoot,
      model: evilModel,
      spawnImpl: (bin, args, _cwd) => {
        observedBin = bin;
        observedArgs = args;
        return makeStubChild({ stdout: "ok\n" }) as never;
      },
    });

    // Drain so the stream's start callback runs.
    const reader = result.stream.getReader();
    while (true) {
      const { done } = await reader.read();
      if (done) break;
    }

    assert.equal(observedBin, "claude", "binary should be `claude`, not bash");
    const i = observedArgs.indexOf("--model");
    assert.ok(i >= 0, "argv should contain --model");
    assert.equal(observedArgs[i + 1], evilModel, "model must land verbatim, no shell expansion");
    // Sanity: argv must not contain bash-like wrapping.
    assert.ok(!observedArgs.includes("-lc"), "spawn must not invoke a shell wrapper");
  } finally {
    fs.rmSync(tmpHome, { recursive: true, force: true });
  }
});

test("POST /api/plan-chat/draft/:id/message with bogus repoRoot returns SSE error event", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const created = await postJson(`${h.baseUrl}/api/plan-chat/draft`);
  const draftId = created.body.data!.draftId as string;

  const bogus = path.join(h.tmpHome, "no-such-repo");
  const res = await fetch(`${h.baseUrl}/api/plan-chat/draft/${draftId}/message`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "text/event-stream" },
    body: JSON.stringify({ message: "hi", repoRoot: bogus }),
  });
  // The error is reported via the SSE stream, not as a 4xx status — the
  // fetch itself succeeds with a single `event: error` frame.
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("content-type"), "text/event-stream");
  const text = await res.text();
  assert.match(text, /event: error/);
  assert.match(text, /repo not found at/);
  assert.match(text, new RegExp(bogus.replace(/[/\\.+*?()[\]{}|^$]/g, "\\$&")));
});

test("POST /api/specs/:id/plan-chat surfaces BAD_CWD when the task's repoRoot is gone", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  // Point the task at a directory that doesn't exist on disk so the
  // server-side cwd resolution falls into BAD_CWD without us having to
  // mock the dropdown.
  const ghostRoot = path.join(h.tmpHome, "ghost-repo");
  makeDraftTask(h.store, "ghost-cwd", ghostRoot, "feat(demo): ghost");

  const res = await fetch(`${h.baseUrl}/api/specs/ghost-cwd/plan-chat`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "text/event-stream" },
    body: JSON.stringify({ message: "hi" }),
  });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("content-type"), "text/event-stream");
  const text = await res.text();
  assert.match(text, /event: error/);
  assert.match(text, /repo not found at/);
});

// ─── stream-json parsing → SSE event vocabulary ─────────────────────────────
//
// Drives runChatTurn with a captured `claude --output-format stream-json`
// fixture to verify the event taxonomy: meta, text, tool_use,
// tool_result, done. The fixture lives in tests/fixtures/.

interface ParsedFrame {
  event: string;
  data: Record<string, unknown>;
}

function parseSseFrames(text: string): ParsedFrame[] {
  const frames: ParsedFrame[] = [];
  for (const raw of text.split("\n\n")) {
    if (!raw.trim()) continue;
    let event = "message";
    const dataLines: string[] = [];
    for (const ln of raw.split("\n")) {
      if (!ln || ln.startsWith(":")) continue;
      const colon = ln.indexOf(":");
      const field = colon === -1 ? ln : ln.slice(0, colon);
      let value = colon === -1 ? "" : ln.slice(colon + 1);
      if (value.startsWith(" ")) value = value.slice(1);
      if (field === "event") event = value;
      else if (field === "data") dataLines.push(value);
    }
    if (dataLines.length === 0) continue;
    try {
      frames.push({ event, data: JSON.parse(dataLines.join("\n")) });
    } catch {
      /* skip */
    }
  }
  return frames;
}

async function drainSse(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const dec = new TextDecoder();
  let out = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    out += dec.decode(value, { stream: true });
  }
  out += dec.decode();
  return out;
}

function fixtureChild(jsonl: string, exitCode = 0): ReturnType<typeof makeStubChild> {
  return makeStubChild({ stdout: jsonl, exitCode });
}

test("runChatTurn emits meta + text + done from a basic stream-json fixture", async () => {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "forge-streamjson-basic-"));
  try {
    const forgeDir = path.join(tmpHome, ".forge");
    fs.mkdirSync(forgeDir, { recursive: true });
    const repoRoot = path.join(tmpHome, "fake-repo");
    fs.mkdirSync(repoRoot, { recursive: true });

    const fixture = fs.readFileSync(path.join(import.meta.dirname, "fixtures", "plan-chat-stream.jsonl"), "utf-8");

    const result = runChatTurn({
      forgeDir,
      scope: { kind: "draft", id: "d_basicfix" },
      message: "say PING",
      cwd: repoRoot,
      spawnImpl: () => fixtureChild(fixture) as never,
    });
    const sse = await drainSse(result.stream);
    const frames = parseSseFrames(sse);

    const eventNames = frames.map((f) => f.event);
    assert.deepEqual(
      eventNames,
      ["meta", "rate_limit", "text", "done"],
      `unexpected event sequence: ${eventNames.join(",")}`,
    );

    const meta = frames[0].data as { sessionId: string; cwd: string };
    assert.equal(meta.cwd, "/Users/tcashel/repositories/forge");
    assert.match(meta.sessionId, /^d9cd675e/);

    const textEv = frames[2].data as { text: string; append: boolean };
    assert.equal(textEv.text, "PING");
    assert.equal(textEv.append, false);

    const done = frames[3].data as { messageId: string; fullText: string };
    assert.match(done.messageId, /^m_[0-9a-f]{8}$/);
    assert.equal(done.fullText, "PING");

    // Persisted assistant message has both text + blocks.
    const history = loadHistory(forgeDir, { kind: "draft", id: "d_basicfix" });
    const assistant = history.messages.find((m: ChatMsgType) => m.role === "assistant");
    assert.ok(assistant, "assistant message must be persisted");
    assert.equal(assistant!.text, "PING");
    assert.ok(Array.isArray(assistant!.blocks) && assistant!.blocks!.length === 1);
    assert.equal(assistant!.blocks![0].type, "text");
  } finally {
    fs.rmSync(tmpHome, { recursive: true, force: true });
  }
});

test("runChatTurn surfaces tool_use + tool_result and persists block sequence", async () => {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "forge-streamjson-tools-"));
  try {
    const forgeDir = path.join(tmpHome, ".forge");
    fs.mkdirSync(forgeDir, { recursive: true });
    const repoRoot = path.join(tmpHome, "fake-repo");
    fs.mkdirSync(repoRoot, { recursive: true });

    const fixture = fs.readFileSync(
      path.join(import.meta.dirname, "fixtures", "plan-chat-stream-tools.jsonl"),
      "utf-8",
    );

    const result = runChatTurn({
      forgeDir,
      scope: { kind: "draft", id: "d_toolfix0" },
      message: "summarize the readme",
      cwd: repoRoot,
      spawnImpl: () => fixtureChild(fixture) as never,
    });
    const sse = await drainSse(result.stream);
    const frames = parseSseFrames(sse);
    const eventNames = frames.map((f) => f.event);

    // Order: meta, text, tool_use, tool_result, text, done
    assert.deepEqual(
      eventNames,
      ["meta", "text", "tool_use", "tool_result", "text", "done"],
      `unexpected event sequence: ${eventNames.join(",")}`,
    );

    const toolUse = frames[2].data as { toolUseId: string; name: string; input: { file_path: string } };
    assert.equal(toolUse.toolUseId, "tu_read1");
    assert.equal(toolUse.name, "Read");
    assert.equal(toolUse.input.file_path, "/tmp/fake-repo/README.md");

    const toolResult = frames[3].data as { toolUseId: string; output: string; isError: boolean };
    assert.equal(toolResult.toolUseId, "tu_read1");
    assert.equal(toolResult.isError, false);
    assert.match(toolResult.output, /Demo/);

    // Persisted blocks reflect text → tool_use → tool_result → text order.
    const history = loadHistory(forgeDir, { kind: "draft", id: "d_toolfix0" });
    const assistant = history.messages.find((m: ChatMsgType) => m.role === "assistant");
    assert.ok(assistant && Array.isArray(assistant.blocks));
    const kinds = assistant!.blocks!.map((b) => b.type);
    assert.deepEqual(kinds, ["text", "tool_use", "tool_result", "text"]);
    // Concatenated text fallback joins both text segments.
    assert.match(assistant!.text, /Let me check the file\./);
    assert.match(assistant!.text, /Found it/);
  } finally {
    fs.rmSync(tmpHome, { recursive: true, force: true });
  }
});

test("runChatTurn skips malformed stream-json lines without aborting the stream", async () => {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "forge-streamjson-malformed-"));
  try {
    const forgeDir = path.join(tmpHome, ".forge");
    fs.mkdirSync(forgeDir, { recursive: true });
    const repoRoot = path.join(tmpHome, "fake-repo");
    fs.mkdirSync(repoRoot, { recursive: true });

    // Mix one bogus line in with valid frames so parsing must skip and
    // continue. Without that resilience, a single torn frame would kill
    // the SSE stream mid-flight.
    const stdout = [
      `{"type":"system","subtype":"init","cwd":"/x","session_id":"sX","tools":[],"model":"m","permissionMode":"bypassPermissions"}`,
      `not-json garbage`,
      `{"type":"assistant","message":{"id":"msg_a","content":[{"type":"text","text":"hello"}]},"session_id":"sX"}`,
      `{"type":"result","subtype":"success","duration_ms":1,"num_turns":1,"result":"hello","total_cost_usd":0,"is_error":false,"session_id":"sX"}`,
      "",
    ].join("\n");

    const result = runChatTurn({
      forgeDir,
      scope: { kind: "draft", id: "d_malform0" },
      message: "hi",
      cwd: repoRoot,
      spawnImpl: () => fixtureChild(stdout) as never,
    });
    const sse = await drainSse(result.stream);
    const eventNames = parseSseFrames(sse).map((f) => f.event);
    assert.deepEqual(eventNames, ["meta", "text", "done"]);
  } finally {
    fs.rmSync(tmpHome, { recursive: true, force: true });
  }
});

// Regression: an assistant frame whose `content` contains two distinct
// text blocks before any tool_use must persist BOTH blocks. Earlier code
// used a single `openTextIdx`, so the second text block clobbered the
// first in `turnBlocks`, silently dropping content from history and the
// SSE stream.
test("runChatTurn keeps multiple text blocks in a single assistant frame", async () => {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "forge-multi-text-"));
  try {
    const forgeDir = path.join(tmpHome, ".forge");
    fs.mkdirSync(forgeDir, { recursive: true });
    const repoRoot = path.join(tmpHome, "fake-repo");
    fs.mkdirSync(repoRoot, { recursive: true });

    const stdout = [
      `{"type":"system","subtype":"init","cwd":"/x","session_id":"sX","tools":[],"model":"m","permissionMode":"bypassPermissions"}`,
      `{"type":"assistant","message":{"id":"msg_multi","content":[{"type":"text","text":"first part"},{"type":"text","text":"second part"}]},"session_id":"sX"}`,
      `{"type":"result","subtype":"success","duration_ms":1,"num_turns":1,"result":"first part\\nsecond part","total_cost_usd":0,"is_error":false,"session_id":"sX"}`,
      "",
    ].join("\n");

    const result = runChatTurn({
      forgeDir,
      scope: { kind: "draft", id: "d_multitxt" },
      message: "hi",
      cwd: repoRoot,
      spawnImpl: () => fixtureChild(stdout) as never,
    });
    const sse = await drainSse(result.stream);
    const frames = parseSseFrames(sse);
    const textFrames = frames.filter((f) => f.event === "text");
    assert.equal(textFrames.length, 2, "both text blocks must emit `text` SSE events");
    assert.equal((textFrames[0].data as { text: string }).text, "first part");
    assert.equal((textFrames[1].data as { text: string }).text, "second part");

    const history = loadHistory(forgeDir, { kind: "draft", id: "d_multitxt" });
    const assistant = history.messages.find((m) => m.role === "assistant");
    assert.ok(assistant, "assistant message must persist");
    const textBlocks = (assistant!.blocks ?? []).filter((b): b is { type: "text"; text: string } => b.type === "text");
    assert.equal(textBlocks.length, 2, "both text blocks must persist in history");
    assert.equal(textBlocks[0].text, "first part");
    assert.equal(textBlocks[1].text, "second part");
  } finally {
    fs.rmSync(tmpHome, { recursive: true, force: true });
  }
});

// ─── Resilience: heartbeat, result metadata, persist-on-cancel ──────────────
//
// These exercise the workbench resilience patch: the SSE response must keep
// the connection alive across long quiet stretches, forward result-event
// metadata into the `done` frame, surface CLI keepalives, and rescue the
// assistant turn when the browser fetch dies mid-stream.

/** Stub child whose stdout is a PassThrough — callers push frames over time
 *  via `pushLine` / `closeStdout` and control the exit code via `exit`. */
function makeControllableChild(): {
  child: EventEmitter & {
    stdout: PassThrough;
    stderr: PassThrough;
    stdin: PassThrough;
    kill: (sig?: string) => boolean;
  };
  pushLine: (json: string) => void;
  closeStdout: () => void;
  exit: (code: number, signal?: NodeJS.Signals | null) => void;
  killed: { value: boolean };
} {
  const stdout = new PassThrough();
  const stderr = new PassThrough();
  const stdin = new PassThrough();
  const killed = { value: false };
  const child = new EventEmitter() as EventEmitter & {
    stdout: PassThrough;
    stderr: PassThrough;
    stdin: PassThrough;
    kill: (sig?: string) => boolean;
  };
  child.stdout = stdout;
  child.stderr = stderr;
  child.stdin = stdin;
  child.kill = (_sig?: string): boolean => {
    killed.value = true;
    return true;
  };
  return {
    child,
    pushLine: (json: string) => stdout.write(`${json}\n`),
    closeStdout: () => stdout.end(),
    exit: (code: number, signal?: NodeJS.Signals | null) => {
      stdout.end();
      child.emit("close", code, signal ?? null);
    },
    killed,
  };
}

test("runChatTurn forwards result-event metadata into the `done` frame", async () => {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "forge-result-meta-"));
  try {
    const forgeDir = path.join(tmpHome, ".forge");
    fs.mkdirSync(forgeDir, { recursive: true });
    const repoRoot = path.join(tmpHome, "fake-repo");
    fs.mkdirSync(repoRoot, { recursive: true });

    const stdout = [
      `{"type":"system","subtype":"init","cwd":"/x","session_id":"sX","tools":[],"model":"m","permissionMode":"bypassPermissions"}`,
      `{"type":"assistant","message":{"id":"msg_meta","content":[{"type":"text","text":"hi"}]},"session_id":"sX"}`,
      // Realistic `result` envelope from a captured fixture — duration,
      // num_turns, total_cost_usd, stop_reason should all bubble through.
      `{"type":"result","subtype":"success","is_error":false,"duration_ms":2345,"num_turns":1,"result":"hi","stop_reason":"end_turn","session_id":"sX","total_cost_usd":0.0123}`,
      "",
    ].join("\n");

    const result = runChatTurn({
      forgeDir,
      scope: { kind: "draft", id: "d_meta0001" },
      message: "hi",
      cwd: repoRoot,
      heartbeatIntervalMs: 0,
      spawnImpl: () => makeStubChild({ stdout }) as never,
    });
    const sse = await drainSse(result.stream);
    const frames = parseSseFrames(sse);
    const done = frames.find((f) => f.event === "done");
    assert.ok(done, "stream must emit a `done` event");
    const data = done!.data as {
      durationMs: number | null;
      totalCostUsd: number | null;
      numTurns: number | null;
      stopReason: string | null;
    };
    assert.equal(data.durationMs, 2345);
    assert.equal(data.totalCostUsd, 0.0123);
    assert.equal(data.numTurns, 1);
    assert.equal(data.stopReason, "end_turn");
  } finally {
    fs.rmSync(tmpHome, { recursive: true, force: true });
  }
});

test("runChatTurn emits SSE heartbeat comments while stdout is idle", async () => {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "forge-hb-"));
  try {
    const forgeDir = path.join(tmpHome, ".forge");
    fs.mkdirSync(forgeDir, { recursive: true });
    const repoRoot = path.join(tmpHome, "fake-repo");
    fs.mkdirSync(repoRoot, { recursive: true });

    const ctl = makeControllableChild();
    // Aggressive heartbeat so the test runs fast.
    const result = runChatTurn({
      forgeDir,
      scope: { kind: "draft", id: "d_hbtest01" },
      message: "hi",
      cwd: repoRoot,
      heartbeatIntervalMs: 25,
      spawnImpl: () => ctl.child as never,
    });

    // Read incrementally — drain a few chunks while the child is silent
    // so the heartbeat has room to fire, then close it out.
    const reader = result.stream.getReader();
    const dec = new TextDecoder();
    let buf = "";
    // First push a real init frame so the parser is engaged.
    ctl.pushLine(
      `{"type":"system","subtype":"init","cwd":"/x","session_id":"sX","tools":[],"model":"m","permissionMode":"bypassPermissions"}`,
    );
    // Read until we observe at least one heartbeat comment. We bound the
    // attempt count so a regression doesn't hang the suite.
    let sawHeartbeat = false;
    for (let i = 0; i < 50 && !sawHeartbeat; i++) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) buf += dec.decode(value, { stream: true });
      if (/(^|\n): hb\n\n/.test(buf)) sawHeartbeat = true;
    }
    assert.ok(sawHeartbeat, `expected to see a ': hb' comment, got: ${buf.slice(0, 400)}`);

    // Wrap up so the stream terminates cleanly.
    ctl.pushLine(
      `{"type":"assistant","message":{"id":"m1","content":[{"type":"text","text":"ok"}]},"session_id":"sX"}`,
    );
    ctl.pushLine(
      `{"type":"result","subtype":"success","duration_ms":1,"num_turns":1,"result":"ok","total_cost_usd":0,"is_error":false,"session_id":"sX"}`,
    );
    ctl.exit(0);
    while (true) {
      const { done } = await reader.read();
      if (done) break;
    }
  } finally {
    fs.rmSync(tmpHome, { recursive: true, force: true });
  }
});

test("runChatTurn forwards CLI ping and api_retry as SSE comments (keepalive)", async () => {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "forge-cli-keepalive-"));
  try {
    const forgeDir = path.join(tmpHome, ".forge");
    fs.mkdirSync(forgeDir, { recursive: true });
    const repoRoot = path.join(tmpHome, "fake-repo");
    fs.mkdirSync(repoRoot, { recursive: true });

    const stdout = [
      `{"type":"system","subtype":"init","cwd":"/x","session_id":"sX","tools":[],"model":"m","permissionMode":"bypassPermissions"}`,
      // Raw API ping wrapped in stream_event — must surface as a comment,
      // not a typed SSE event (no consumer wants it semantically).
      `{"type":"stream_event","event":{"type":"ping"},"session_id":"sX"}`,
      // CLI-emitted retry notice — also a keepalive-grade signal.
      `{"type":"system","subtype":"api_retry","attempt":1,"max_retries":3,"retry_delay_ms":1000,"error":"rate_limit","error_status":429,"session_id":"sX"}`,
      `{"type":"assistant","message":{"id":"m1","content":[{"type":"text","text":"hi"}]},"session_id":"sX"}`,
      `{"type":"result","subtype":"success","duration_ms":1,"num_turns":1,"result":"hi","total_cost_usd":0,"is_error":false,"session_id":"sX"}`,
      "",
    ].join("\n");

    const result = runChatTurn({
      forgeDir,
      scope: { kind: "draft", id: "d_cliping0" },
      message: "hi",
      cwd: repoRoot,
      heartbeatIntervalMs: 0,
      spawnImpl: () => makeStubChild({ stdout }) as never,
    });
    const sse = await drainSse(result.stream);
    assert.match(sse, /: cli_ping\n\n/, "ping must emit a `: cli_ping` SSE comment");
    assert.match(sse, /: api_retry attempt=1 reason=rate_limit\n\n/, "api_retry must emit a labelled SSE comment");

    // Comments must not appear as typed events to the SSE consumer.
    const eventNames = parseSseFrames(sse).map((f) => f.event);
    assert.ok(!eventNames.includes("ping"));
    assert.ok(!eventNames.includes("api_retry"));
  } finally {
    fs.rmSync(tmpHome, { recursive: true, force: true });
  }
});

test("runChatTurn persists the assistant turn even when the client disconnected mid-stream", async () => {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "forge-persist-cancel-"));
  try {
    const forgeDir = path.join(tmpHome, ".forge");
    fs.mkdirSync(forgeDir, { recursive: true });
    const repoRoot = path.join(tmpHome, "fake-repo");
    fs.mkdirSync(repoRoot, { recursive: true });

    const ctl = makeControllableChild();
    const result = runChatTurn({
      forgeDir,
      scope: { kind: "draft", id: "d_cancel01" },
      message: "hi",
      cwd: repoRoot,
      heartbeatIntervalMs: 0,
      spawnImpl: () => ctl.child as never,
    });

    // Read just enough to engage the parser, then cancel as if the
    // browser fetch died.
    const reader = result.stream.getReader();
    ctl.pushLine(
      `{"type":"system","subtype":"init","cwd":"/x","session_id":"sX","tools":[],"model":"m","permissionMode":"bypassPermissions"}`,
    );
    ctl.pushLine(
      `{"type":"assistant","message":{"id":"m1","content":[{"type":"text","text":"the reply that must survive"}]},"session_id":"sX"}`,
    );
    // Drain pending bytes so the runtime delivers the writes.
    await reader.read();
    await reader.read();

    // Client disconnect: cancel the consumer side. The stream's `cancel`
    // hook fires SIGTERM at the child and flips the `cancelled` flag.
    await reader.cancel();
    assert.equal(ctl.killed.value, true, "child must be SIGTERM-ed on cancel");

    // Now simulate the child actually exiting (post-SIGTERM). The close
    // handler should still persist the assistant turn even though the
    // SSE stream is already torn down.
    ctl.exit(0, "SIGTERM");

    // Give the persist path one tick to land — `appendMessage` is sync,
    // but the close handler runs after our `cancel()` await resolves.
    await new Promise((r) => setImmediate(r));

    const history = loadHistory(forgeDir, { kind: "draft", id: "d_cancel01" });
    const assistant = history.messages.find((m) => m.role === "assistant");
    assert.ok(assistant, "assistant message must be persisted even after client disconnect");
    assert.equal(assistant!.text, "the reply that must survive");
  } finally {
    fs.rmSync(tmpHome, { recursive: true, force: true });
  }
});

test("runChatTurn does NOT persist an empty turn when the client disconnects before content arrives", async () => {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "forge-cancel-empty-"));
  try {
    const forgeDir = path.join(tmpHome, ".forge");
    fs.mkdirSync(forgeDir, { recursive: true });
    const repoRoot = path.join(tmpHome, "fake-repo");
    fs.mkdirSync(repoRoot, { recursive: true });

    const ctl = makeControllableChild();
    const result = runChatTurn({
      forgeDir,
      scope: { kind: "draft", id: "d_cancmt00" },
      message: "hi",
      cwd: repoRoot,
      heartbeatIntervalMs: 0,
      spawnImpl: () => ctl.child as never,
    });
    const reader = result.stream.getReader();
    // Only emit the init frame — no assistant content.
    ctl.pushLine(
      `{"type":"system","subtype":"init","cwd":"/x","session_id":"sX","tools":[],"model":"m","permissionMode":"bypassPermissions"}`,
    );
    await reader.read();
    await reader.cancel();
    ctl.exit(0, "SIGTERM");
    await new Promise((r) => setImmediate(r));

    const history = loadHistory(forgeDir, { kind: "draft", id: "d_cancmt00" });
    const assistant = history.messages.find((m) => m.role === "assistant");
    assert.equal(assistant, undefined, "no assistant turn should be persisted when there was no content");
  } finally {
    fs.rmSync(tmpHome, { recursive: true, force: true });
  }
});

// ─── Structured error frame on failure (Suspects 2, 3, 4) ──────────────────
//
// These are synthetic reproductions for the failure mode this PR chases:
// the planner chat occasionally dies as a generic "network error" with no
// actionable detail. We exercise the three plausible server-side root
// causes from the spec — non-zero exit with stderr (Suspect 2), child
// SIGTERM'd mid-stream (Suspect 3), and a silent close from the route
// handler / proxy (Suspect 4, covered client-side in sse-chat-dispatch
// tests). For each, the SSE `error` frame must carry the structured
// `{message, exitCode, signal, stderrTail, promptFile}` payload so the
// chat UI can show the user what actually went wrong instead of swallowing
// it in favor of "Failed to fetch".

function findErrorFrame(frames: ParsedFrame[]): ParsedFrame | undefined {
  return frames.find((f) => f.event === "error");
}

test("Suspect 2 — claude exits non-zero with stderr: server emits structured error SSE frame", async () => {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "forge-nonzero-exit-"));
  try {
    const forgeDir = path.join(tmpHome, ".forge");
    fs.mkdirSync(forgeDir, { recursive: true });
    const repoRoot = path.join(tmpHome, "fake-repo");
    fs.mkdirSync(repoRoot, { recursive: true });

    // Realistic stream-json prefix + a recognisable stderr fragment + non-
    // zero exit. Mirrors what we'd see if claude ran for a bit, hit a
    // failure case, and aborted.
    const stdout = [
      `{"type":"system","subtype":"init","cwd":"/x","session_id":"sX","tools":[],"model":"m","permissionMode":"bypassPermissions"}`,
      `{"type":"assistant","message":{"id":"msg_a","content":[{"type":"text","text":"starting to think…"}]},"session_id":"sX"}`,
      "",
    ].join("\n");
    const stderr =
      "Error: ENOENT no such directory '/repo'\n  at Module._resolveFilename (node:internal/modules/cjs/loader)\n";

    const result = runChatTurn({
      forgeDir,
      scope: { kind: "draft", id: "d_err00001" },
      message: "do the thing",
      cwd: repoRoot,
      heartbeatIntervalMs: 0,
      spawnImpl: () => makeStubChild({ stdout, stderr, exitCode: 2 }) as never,
    });
    const sse = await drainSse(result.stream);
    const frames = parseSseFrames(sse);

    const err = findErrorFrame(frames);
    assert.ok(err, "non-zero exit must emit an `error` SSE frame");
    const data = err!.data as {
      message: string;
      exitCode: number | null;
      signal: string | null;
      stderrTail: string | null;
      promptFile: string;
    };
    assert.equal(data.exitCode, 2, "exit code must be carried verbatim");
    assert.equal(data.signal, null);
    assert.ok(data.stderrTail, "stderrTail must be populated");
    assert.match(data.stderrTail!, /ENOENT no such directory/, "stderr fragment must be preserved");
    assert.match(data.message, /code 2/, "message references exit code 2 so the user knows it failed");
    assert.match(data.message, /ENOENT/, "message includes a recognisable fragment of stderr");
    assert.ok(typeof data.promptFile === "string" && data.promptFile.length > 0, "promptFile must be set");
    assert.match(data.promptFile, /turn-\d+\.txt$/, "promptFile points at the retained turn file");
    assert.equal(fs.existsSync(data.promptFile), true, "prompt file must remain on disk for post-mortem");

    // Partial assistant turn must NOT be persisted to history — otherwise
    // a re-send would inherit the broken context. The UI keeps the
    // already-streamed blocks visible until the next user turn (frontend
    // failedBlocks signal in PlannerChat.tsx).
    const history = loadHistory(forgeDir, { kind: "draft", id: "d_err00001" });
    const assistant = history.messages.find((m) => m.role === "assistant");
    assert.equal(assistant, undefined, "non-zero exit must not persist a partial assistant turn");
  } finally {
    fs.rmSync(tmpHome, { recursive: true, force: true });
  }
});

test("Suspect 3 — claude SIGTERM'd mid-stream: error frame carries the signal name", async () => {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "forge-sigterm-mid-"));
  try {
    const forgeDir = path.join(tmpHome, ".forge");
    fs.mkdirSync(forgeDir, { recursive: true });
    const repoRoot = path.join(tmpHome, "fake-repo");
    fs.mkdirSync(repoRoot, { recursive: true });

    const ctl = makeControllableChild();
    const result = runChatTurn({
      forgeDir,
      scope: { kind: "draft", id: "d_sigterm0" },
      message: "hi",
      cwd: repoRoot,
      heartbeatIntervalMs: 0,
      spawnImpl: () => ctl.child as never,
    });

    // Emit a partial text block, then "reap" the child mid-stream (the
    // 5-min reaper does exactly this via SIGTERM). Crucially the client
    // is still listening — this is NOT a cancel, it's a server-side
    // teardown — so we must surface a structured error.
    ctl.pushLine(
      `{"type":"system","subtype":"init","cwd":"/x","session_id":"sX","tools":[],"model":"m","permissionMode":"bypassPermissions"}`,
    );
    ctl.pushLine(
      `{"type":"assistant","message":{"id":"m1","content":[{"type":"text","text":"about to be killed"}]},"session_id":"sX"}`,
    );
    // Drain a couple of chunks so the parser has consumed both lines
    // before the child dies — otherwise the assistant frame races with
    // the close.
    const reader = result.stream.getReader();
    const dec = new TextDecoder();
    let raw = "";
    for (let i = 0; i < 6; i++) {
      const { value, done } = await reader.read();
      if (done) break;
      raw += dec.decode(value, { stream: true });
      if (/event: text/.test(raw)) break;
    }
    // Now SIGTERM. code=null, signal="SIGTERM".
    ctl.exit(null as unknown as number, "SIGTERM");
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) raw += dec.decode(value, { stream: true });
    }
    raw += dec.decode();

    const frames = parseSseFrames(raw);
    const err = findErrorFrame(frames);
    assert.ok(err, "signal-terminated child must emit an `error` SSE frame");
    const data = err!.data as {
      message: string;
      exitCode: number | null;
      signal: string | null;
      promptFile: string;
    };
    assert.equal(data.signal, "SIGTERM", "signal name must be forwarded");
    assert.match(data.message, /SIGTERM/, "banner message names the signal");
    assert.equal(fs.existsSync(data.promptFile), true, "prompt file retained for post-mortem");

    // History must NOT contain the partial reply.
    const history = loadHistory(forgeDir, { kind: "draft", id: "d_sigterm0" });
    const assistant = history.messages.find((m) => m.role === "assistant");
    assert.equal(assistant, undefined, "signal-killed turn must not persist its partial blocks to history");
  } finally {
    fs.rmSync(tmpHome, { recursive: true, force: true });
  }
});

test("cleanStderrTail strips control chars but preserves newlines and tabs", () => {
  // ANSI escape sequence + tab + newline + DEL + visible text. We want
  // the newline and tab kept, the escape and DEL stripped.
  const raw = "[31mError[0m:\tunexpected\ntab and newline survive";
  const cleaned = cleanStderrTail(raw);
  assert.ok(cleaned);
  assert.equal(cleaned!.includes(""), false, "ANSI escape stripped");
  assert.equal(cleaned!.includes(""), false, "DEL stripped");
  // `\t` (0x09) must survive. The leftover `[31m` / `[0m` fragments come
  // from the original ANSI escape (the `\x1b` got stripped but the visible
  // suffix didn't). The point is the tab is still there.
  assert.ok(cleaned!.includes("\tunexpected"), "tab character preserved");
  assert.match(cleaned!, /tab and newline survive/, "post-newline content preserved");
  assert.ok(cleaned!.includes("\n"), "newline preserved");
});

test("cleanStderrTail returns null for empty / whitespace-only / null-byte stderr", () => {
  assert.equal(cleanStderrTail(""), null);
  assert.equal(cleanStderrTail("   "), null);
  assert.equal(cleanStderrTail("   "), null);
});

test("cleanStderrTail caps the result at the last ≤500 chars", () => {
  const raw = "x".repeat(800) + "\nfinal-line";
  const cleaned = cleanStderrTail(raw);
  assert.ok(cleaned);
  // Final line survives at the tail.
  assert.match(cleaned!, /final-line$/);
  // No more than the cap.
  assert.ok(cleaned!.length <= 500);
});

test("loadSkillPrompt forbids calling ExitPlanMode from the Workbench planner chat", () => {
  const prompt = loadSkillPrompt();
  // The skill is shared across the Forge planner CLI and the Workbench
  // chat surface. The chat surface runs non-interactively, so we must
  // explicitly tell the model not to invoke plan-mode tools — calling
  // ExitPlanMode here ends the turn before the model replies and the SSE
  // stream closes without a `done` frame.
  assert.match(prompt, /ExitPlanMode/i, "the prompt must mention ExitPlanMode by name");
  // The instruction must be a prohibition, not a hint. Look for one of
  // the conventional negative-instruction phrasings.
  assert.match(
    prompt,
    /(do not call|do not invoke|don't call|don't invoke|never call|never invoke|treat plan-mode tools as unavailable)/i,
  );
});
