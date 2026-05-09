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
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { startServer } from "../src/cli/cmd/serve.ts";
import { ForgeStore, type TaskRecord } from "../src/core/store.ts";

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
  data?: Record<string, unknown> & { messages?: unknown[]; draftId?: string; taskId?: string };
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

function makeDraftTask(store: ForgeStore, id: string, repoRoot: string, title: string): TaskRecord {
  const now = new Date().toISOString();
  const specBody = `# ${title}\n\nA stub spec body for chat tests.\n`;
  const specPath = store.writeSpec(id, specBody);
  const task: TaskRecord = {
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
  };
  store.upsertTask(task);
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
  const taskId = "wipe-target";
  makeDraftTask(h.store, taskId, h.tmpHome, "feat(demo): wipe");
  // Hand-write some history.
  const dir = path.join(h.forgeDir, "specs", taskId);
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
  const before = await getJson(`${h.baseUrl}/api/specs/${taskId}/plan-history`);
  assert.equal((before.body.data!.messages as unknown[]).length, 2);

  const { status, body } = await delJson(`${h.baseUrl}/api/specs/${taskId}/plan-history`);
  assert.equal(status, 200);
  assert.equal(body.data!.ok, true);
  assert.equal(fs.existsSync(histFile), false);

  const after = await getJson(`${h.baseUrl}/api/specs/${taskId}/plan-history`);
  assert.deepEqual(after.body.data!.messages, []);
});

test("POST /api/plan-chat/draft/:id/promote moves draft history into the spec dir", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const taskId = "promote-target";
  makeDraftTask(h.store, taskId, h.tmpHome, "feat(demo): promote");

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

  const { status, body } = await postJson(`${h.baseUrl}/api/plan-chat/draft/${draftId}/promote`, { taskId });
  assert.equal(status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.data!.taskId, taskId);

  // Draft folder gone, spec history file present with the original payload.
  const draftDir = path.join(h.forgeDir, "plan-drafts", draftId);
  assert.equal(fs.existsSync(draftDir), false);
  const targetFile = path.join(h.forgeDir, "specs", taskId, "plan-history.json");
  assert.equal(fs.existsSync(targetFile), true);
  const moved = JSON.parse(fs.readFileSync(targetFile, "utf-8"));
  assert.deepEqual(moved.messages, sample.messages);
});

test("POST /api/plan-chat/draft/:id/promote 404s for an unknown taskId", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const created = await postJson(`${h.baseUrl}/api/plan-chat/draft`);
  const draftId = created.body.data!.draftId as string;
  const { status, body } = await postJson(`${h.baseUrl}/api/plan-chat/draft/${draftId}/promote`, {
    taskId: "does-not-exist",
  });
  assert.equal(status, 404);
  assert.equal(body.error!.code, "UNKNOWN_TASK");
});

test("POST /api/plan-chat/draft/:id/promote rejects when spec already has plan history", async (t) => {
  const h = await bootServer();
  t.after(() => h.stop());
  const taskId = "promote-conflict";
  makeDraftTask(h.store, taskId, h.tmpHome, "feat(demo): conflict");
  // Pre-seed an existing plan-history.json on the spec.
  const dir = path.join(h.forgeDir, "specs", taskId);
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

  const { status, body } = await postJson(`${h.baseUrl}/api/plan-chat/draft/${draftId}/promote`, { taskId });
  assert.equal(status, 409);
  assert.equal(body.error!.code, "PROMOTE_CONFLICT");
});

test("POST /api/specs/:id/plan-chat returns 404 for unknown taskId", async (t) => {
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
  const { status, body } = await postJson(`${h.baseUrl}/api/plan-chat/draft/d_nonexist/message`, { message: "hi" });
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
