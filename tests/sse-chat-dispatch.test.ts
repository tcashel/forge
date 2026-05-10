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
  type ChatMeta,
  type ChatRateLimit,
  type ChatStreamListeners,
  type ChatTextEvent,
  type ChatToolResultEvent,
  type ChatToolUseEvent,
  dispatchChatEvent,
  type SseEvent,
} from "../src/web/lib/sse.ts";

interface Captured {
  meta: ChatMeta[];
  text: ChatTextEvent[];
  toolUse: ChatToolUseEvent[];
  toolResult: ChatToolResultEvent[];
  rate: ChatRateLimit[];
  done: ChatDoneEvent[];
  error: string[];
  delta: string[];
}

function makeListeners(): { captured: Captured; listeners: ChatStreamListeners } {
  const captured: Captured = {
    meta: [],
    text: [],
    toolUse: [],
    toolResult: [],
    rate: [],
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
    onDone: (e) => captured.done.push(e),
    onError: (m) => captured.error.push(m),
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
  assert.deepEqual(captured.error, ["stream error"]);
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
      captured.done.length +
      captured.error.length +
      captured.delta.length,
    0,
  );
});
