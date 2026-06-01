/**
 * Unit tests for `dispatchChatEvent` in src/web/lib/sse.ts. The real
 * stream-json → SSE pipeline is covered by tests/plan-chat.test.ts; this
 * file pins the front-end's mapping from typed SSE events to listener
 * callbacks so the chat UI can rely on a stable contract.
 */

import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  type ChatDoneEvent,
  type ChatErrorEvent,
  type ChatMeta,
  type ChatRateLimit,
  type ChatStreamListeners,
  type ChatTextEvent,
  type ChatToolResultEvent,
  type ChatToolUseEvent,
  dispatchChatEvent,
  type PlanUpdatedEvent,
  type SseEvent,
  startChatStream,
} from "../src/web/lib/sse.ts";

interface Captured {
  meta: ChatMeta[];
  text: ChatTextEvent[];
  toolUse: ChatToolUseEvent[];
  toolResult: ChatToolResultEvent[];
  rate: ChatRateLimit[];
  planUpdated: PlanUpdatedEvent[];
  done: ChatDoneEvent[];
  error: ChatErrorEvent[];
  delta: string[];
}

function makeListeners(): { captured: Captured; listeners: ChatStreamListeners } {
  const captured: Captured = {
    meta: [],
    text: [],
    toolUse: [],
    toolResult: [],
    rate: [],
    planUpdated: [],
    done: [],
    error: [],
    delta: [],
  };
  const listeners: ChatStreamListeners = {
    onMeta: (e) => captured.meta.push(e),
    onTextDelta: (e) => captured.text.push(e),
    onToolUse: (e) => captured.toolUse.push(e),
    onToolResult: (e) => captured.toolResult.push(e),
    onRateLimit: (e) => captured.rate.push(e),
    onPlanUpdated: (e) => captured.planUpdated.push(e),
    onDone: (e) => captured.done.push(e),
    onError: (e) => captured.error.push(e),
    onDelta: (t) => captured.delta.push(t),
  };
  return { captured, listeners };
}

function frame(event: string, data: unknown): SseEvent {
  return { event, data: JSON.stringify(data) };
}

test("dispatchChatEvent maps meta event to onMeta with safe defaults", () => {
  const { captured, listeners } = makeListeners();
  dispatchChatEvent(frame("meta", { sessionId: "s_1", model: "m", cwd: "/r", tools: ["Read", 1, "Grep"] }), listeners);
  assert.equal(captured.meta.length, 1);
  assert.deepEqual(captured.meta[0], { sessionId: "s_1", model: "m", cwd: "/r", tools: ["Read", "Grep"] });
});

test("dispatchChatEvent maps plan_updated event to onPlanUpdated", () => {
  const { captured, listeners } = makeListeners();
  dispatchChatEvent(
    frame("plan_updated", { planId: "p1", specVersion: 3, openQuestionCount: 2, pendingEditId: "pe_1" }),
    listeners,
  );
  assert.deepEqual(captured.planUpdated, [
    { planId: "p1", specVersion: 3, openQuestionCount: 2, pendingEditId: "pe_1" },
  ]);
});

test("dispatchChatEvent forwards text events to onTextDelta and onDelta", () => {
  const { captured, listeners } = makeListeners();
  dispatchChatEvent(frame("text", { blockId: "b1", text: "hello", append: false }), listeners);
  assert.equal(captured.text.length, 1);
  assert.equal(captured.text[0].text, "hello");
  assert.equal(captured.text[0].append, false);
  assert.deepEqual(captured.delta, ["hello"]);
});

test("dispatchChatEvent maps tool_use + tool_result by id", () => {
  const { captured, listeners } = makeListeners();
  dispatchChatEvent(frame("tool_use", { toolUseId: "tu_1", name: "Read", input: { file_path: "/f" } }), listeners);
  dispatchChatEvent(
    frame("tool_result", { toolUseId: "tu_1", output: "ok", isError: false, truncated: false }),
    listeners,
  );
  assert.deepEqual(captured.toolUse, [{ toolUseId: "tu_1", name: "Read", input: { file_path: "/f" } }]);
  assert.deepEqual(captured.toolResult, [{ toolUseId: "tu_1", output: "ok", isError: false, truncated: false }]);
});

test("dispatchChatEvent fills in null defaults for missing done fields", () => {
  const { captured, listeners } = makeListeners();
  dispatchChatEvent(frame("done", { messageId: "m_x", fullText: "ok" }), listeners);
  assert.equal(captured.done.length, 1);
  assert.equal(captured.done[0].messageId, "m_x");
  assert.equal(captured.done[0].fullText, "ok");
  assert.equal(captured.done[0].durationMs, null);
  assert.equal(captured.done[0].totalCostUsd, null);
  assert.equal(captured.done[0].numTurns, null);
});

test("dispatchChatEvent treats malformed JSON as a silent no-op (except error → fallback message)", () => {
  const { captured, listeners } = makeListeners();
  dispatchChatEvent({ event: "text", data: "{not json}" }, listeners);
  dispatchChatEvent({ event: "tool_use", data: "{not json}" }, listeners);
  dispatchChatEvent({ event: "error", data: "{not json}" }, listeners);
  assert.equal(captured.text.length, 0);
  assert.equal(captured.toolUse.length, 0);
  // error always invokes onError — falls back to the default message.
  assert.equal(captured.error.length, 1);
  assert.equal(captured.error[0].message, "stream error");
  assert.equal(captured.error[0].exitCode, null);
  assert.equal(captured.error[0].signal, null);
  assert.equal(captured.error[0].stderrTail, null);
  assert.equal(captured.error[0].promptFile, null);
});

test("dispatchChatEvent surfaces the structured error payload verbatim", () => {
  const { captured, listeners } = makeListeners();
  dispatchChatEvent(
    frame("error", {
      message: "claude exited with code 1: ENOENT: claude binary missing",
      exitCode: 1,
      signal: null,
      stderrTail: "ENOENT: claude binary missing\nat /usr/bin/claude",
      promptFile: "/home/u/.forge/plan-drafts/d_abc/turn-3.txt",
    }),
    listeners,
  );
  assert.equal(captured.error.length, 1);
  const e = captured.error[0];
  assert.equal(e.message, "claude exited with code 1: ENOENT: claude binary missing");
  assert.equal(e.exitCode, 1);
  assert.equal(e.signal, null);
  assert.equal(e.stderrTail, "ENOENT: claude binary missing\nat /usr/bin/claude");
  assert.equal(e.promptFile, "/home/u/.forge/plan-drafts/d_abc/turn-3.txt");
});

test("dispatchChatEvent: signal-only error frame preserves the signal name", () => {
  const { captured, listeners } = makeListeners();
  dispatchChatEvent(
    frame("error", { message: "claude exited via signal SIGTERM", exitCode: null, signal: "SIGTERM" }),
    listeners,
  );
  assert.equal(captured.error[0].signal, "SIGTERM");
  assert.equal(captured.error[0].exitCode, null);
});

test("dispatchChatEvent forwards legacy `delta` events to onDelta only", () => {
  const { captured, listeners } = makeListeners();
  dispatchChatEvent(frame("delta", { text: "legacy" }), listeners);
  assert.deepEqual(captured.delta, ["legacy"]);
  assert.equal(captured.text.length, 0);
});

test("dispatchChatEvent ignores unknown event names", () => {
  const { captured, listeners } = makeListeners();
  dispatchChatEvent(frame("unknown_future_event", { foo: "bar" }), listeners);
  // Nothing fired anywhere.
  assert.equal(
    captured.meta.length +
      captured.text.length +
      captured.toolUse.length +
      captured.toolResult.length +
      captured.rate.length +
      captured.planUpdated.length +
      captured.done.length +
      captured.error.length +
      captured.delta.length,
    0,
  );
});

// ─── startChatStream — silent close detection ───────────────────────────────
//
// The original "transient network error" the surrounding PR is chasing
// manifested as the SSE stream closing without ever emitting `done` or
// `error`. Without the wrapper below, the caller's `finally` block
// fell into the generic "Failed to fetch" fallback. We assert here that
// `startChatStream` synthesises a structured `ChatErrorEvent` whose
// message is specific enough to be actionable.

/** Build a `fetch`-compatible mock that returns a fixed SSE body. */
function mockFetchOk(sseBody: string): typeof fetch {
  const fn = async (_url: string | URL | Request) => {
    return new Response(sseBody, {
      status: 200,
      headers: { "content-type": "text/event-stream" },
    });
  };
  return fn as unknown as typeof fetch;
}

test("startChatStream surfaces a specific banner when the server closes after `text` but before `done`", async () => {
  const { captured, listeners } = makeListeners();
  const origFetch = globalThis.fetch;
  const sseBody = ["event: text", `data: ${JSON.stringify({ blockId: "b1", text: "partial reply" })}`, "", ""].join(
    "\n",
  );
  globalThis.fetch = mockFetchOk(sseBody) as typeof fetch;
  try {
    await startChatStream({
      url: "/api/plan-chat/draft/d_test/message",
      body: { message: "hi" },
      listeners,
    });
  } finally {
    globalThis.fetch = origFetch;
  }
  assert.equal(captured.text.length, 1, "the text frame must still dispatch normally");
  assert.equal(captured.text[0].text, "partial reply");
  assert.equal(captured.done.length, 0, "no done frame arrived");
  assert.equal(captured.error.length, 1, "silent close must synthesise an error frame");
  // The banner string is intentionally specific so the user knows what
  // happened — NOT a generic "stream error" / "network error".
  assert.match(captured.error[0].message, /stream closed before .*done/);
  // Synthesised events from the silent-close detector carry no exit
  // info — that's a server-side property the wire never delivered.
  assert.equal(captured.error[0].exitCode, null);
  assert.equal(captured.error[0].signal, null);
});

test("startChatStream does NOT synthesise an error when the server emits `done`", async () => {
  const { captured, listeners } = makeListeners();
  const origFetch = globalThis.fetch;
  const sseBody = [
    "event: text",
    `data: ${JSON.stringify({ blockId: "b1", text: "hi" })}`,
    "",
    "event: done",
    `data: ${JSON.stringify({ messageId: "m_1", fullText: "hi" })}`,
    "",
    "",
  ].join("\n");
  globalThis.fetch = mockFetchOk(sseBody) as typeof fetch;
  try {
    await startChatStream({
      url: "/api/plan-chat/draft/d_test/message",
      body: { message: "hi" },
      listeners,
    });
  } finally {
    globalThis.fetch = origFetch;
  }
  assert.equal(captured.done.length, 1);
  assert.equal(captured.error.length, 0, "no synthetic error when done arrived");
});

test("startChatStream does NOT double-fire when the server already emitted a structured error", async () => {
  const { captured, listeners } = makeListeners();
  const origFetch = globalThis.fetch;
  const sseBody = [
    "event: error",
    `data: ${JSON.stringify({
      message: "claude exited with code 2: bad model",
      exitCode: 2,
      signal: null,
      stderrTail: "bad model",
      promptFile: "/tmp/turn-1.txt",
    })}`,
    "",
    "",
  ].join("\n");
  globalThis.fetch = mockFetchOk(sseBody) as typeof fetch;
  try {
    await startChatStream({
      url: "/api/plan-chat/draft/d_test/message",
      body: { message: "hi" },
      listeners,
    });
  } finally {
    globalThis.fetch = origFetch;
  }
  // Exactly one error frame — the server's. No silent-close synthesis.
  assert.equal(captured.error.length, 1);
  assert.equal(captured.error[0].exitCode, 2);
  assert.equal(captured.error[0].promptFile, "/tmp/turn-1.txt");
});
