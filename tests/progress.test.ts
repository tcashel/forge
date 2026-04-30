import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  applyEvent,
  emptySnapshot,
  type ProgressEvent,
  RECENT_TOOLS_LIMIT,
  SCHEMA_VERSION,
  type Snapshot,
} from "../src/progress.ts";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function snap(overrides?: Partial<Snapshot>): Snapshot {
  return { ...emptySnapshot("test-1", 1000), ...overrides };
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test("emptySnapshot has expected defaults", () => {
  const s = emptySnapshot("task-42", 5000);
  assert.equal(s.schemaVersion, SCHEMA_VERSION);
  assert.equal(s.taskId, "task-42");
  assert.equal(s.phase, "starting");
  assert.equal(s.health, "active");
  assert.equal(s.startedAt, 5000);
  assert.equal(s.lastEventAt, 5000);
  assert.equal(s.agentPid, null);
  assert.equal(s.currentTool, null);
  assert.deepEqual(s.recentTools, []);
  assert.equal(s.lastAssistantText, null);
  assert.equal(s.usage.inputTokens, 0);
  assert.equal(s.usage.outputTokens, 0);
  assert.equal(s.usage.cacheReadTokens, 0);
  assert.equal(s.usage.cacheWriteTokens, 0);
  assert.equal(s.usage.costUsd, 0);
  assert.equal(s.usage.contextTokens, 0);
  assert.equal(s.usage.turns, 0);
  assert.deepEqual(s.alerts, []);
  assert.deepEqual(s.qualityResults, []);
  assert.equal(s.prUrl, null);
  assert.equal(s.exitCode, null);
  assert.equal(s.errorMessage, null);
});

test("applyEvent does not mutate prev", () => {
  const prev = snap();
  const clone = deepClone(prev);
  applyEvent(prev, { t: 2000, type: "phase_change", from: "starting", to: "agent" });
  assert.deepEqual(prev, clone);
});

test("phase_change updates phase and lastEventAt", () => {
  const s = applyEvent(snap(), { t: 2000, type: "phase_change", from: "starting", to: "agent" });
  assert.equal(s.phase, "agent");
  assert.equal(s.lastEventAt, 2000);
});

test("phase_change to agent sets health=active when prev was not error", () => {
  const prev = snap({ health: "stalled", phase: "starting" });
  const s = applyEvent(prev, { t: 2000, type: "phase_change", from: "starting", to: "agent" });
  assert.equal(s.health, "active");
});

test("phase_change to agent clears stale error to active", () => {
  const prev = snap({ health: "error", phase: "starting" });
  const s = applyEvent(prev, { t: 2000, type: "phase_change", from: "starting", to: "agent" });
  assert.equal(s.health, "active");
});

test("tool_start populates currentTool with null endedAt and isError", () => {
  const s = applyEvent(snap({ phase: "agent" }), {
    t: 3000,
    type: "tool_start",
    toolCallId: "tc-1",
    toolName: "bash",
    argsPreview: "ls -la",
  });
  assert.notEqual(s.currentTool, null);
  assert.equal(s.currentTool!.toolCallId, "tc-1");
  assert.equal(s.currentTool!.toolName, "bash");
  assert.equal(s.currentTool!.argsPreview, "ls -la");
  assert.equal(s.currentTool!.startedAt, 3000);
  assert.equal(s.currentTool!.endedAt, null);
  assert.equal(s.currentTool!.isError, null);
});

test("tool_end appends to recentTools, clears currentTool, respects RECENT_TOOLS_LIMIT", () => {
  let s = snap({ phase: "agent" });
  // Feed 7 tool start/end pairs
  for (let i = 0; i < 7; i++) {
    s = applyEvent(s, {
      t: 3000 + i * 100,
      type: "tool_start",
      toolCallId: `tc-${i}`,
      toolName: "bash",
      argsPreview: `cmd-${i}`,
    });
    s = applyEvent(s, {
      t: 3050 + i * 100,
      type: "tool_end",
      toolCallId: `tc-${i}`,
      toolName: "bash",
      isError: false,
      durationMs: 50,
    });
  }
  assert.equal(s.recentTools.length, RECENT_TOOLS_LIMIT);
  assert.equal(s.currentTool, null);
  // Oldest should be tc-2 (0,1 trimmed off)
  assert.equal(s.recentTools[0].toolCallId, "tc-2");
  assert.equal(s.recentTools[4].toolCallId, "tc-6");
});

test("tool_end with isError sets health=error", () => {
  let s = snap({ phase: "agent" });
  s = applyEvent(s, { t: 3000, type: "tool_start", toolCallId: "tc-1", toolName: "bash", argsPreview: "fail" });
  s = applyEvent(s, {
    t: 3100,
    type: "tool_end",
    toolCallId: "tc-1",
    toolName: "bash",
    isError: true,
    durationMs: 100,
  });
  assert.equal(s.health, "error");
});

test("tool_end with mismatched toolCallId does not clear currentTool but still appends", () => {
  let s = snap({ phase: "agent" });
  s = applyEvent(s, { t: 3000, type: "tool_start", toolCallId: "tc-1", toolName: "read", argsPreview: "file.ts" });
  // End a different tool (lost start event)
  s = applyEvent(s, {
    t: 3100,
    type: "tool_end",
    toolCallId: "tc-2",
    toolName: "bash",
    isError: false,
    durationMs: 50,
  });
  // currentTool should still be tc-1
  assert.notEqual(s.currentTool, null);
  assert.equal(s.currentTool!.toolCallId, "tc-1");
  // recentTools should have the synthetic entry for tc-2
  assert.equal(s.recentTools.length, 1);
  assert.equal(s.recentTools[0].toolCallId, "tc-2");
});

test("assistant_text updates lastAssistantText", () => {
  const s = applyEvent(snap(), { t: 4000, type: "assistant_text", preview: "Hello world" });
  assert.equal(s.lastAssistantText, "Hello world");
  assert.equal(s.lastEventAt, 4000);
});

test("usage replaces totals atomically (not additive)", () => {
  const usage1 = {
    inputTokens: 100,
    outputTokens: 50,
    cacheReadTokens: 10,
    cacheWriteTokens: 5,
    costUsd: 0.01,
    contextTokens: 200,
    turns: 1,
  };
  const usage2 = {
    inputTokens: 300,
    outputTokens: 150,
    cacheReadTokens: 30,
    cacheWriteTokens: 15,
    costUsd: 0.03,
    contextTokens: 600,
    turns: 3,
  };
  let s = applyEvent(snap(), { t: 4000, type: "usage", turn: 1, usage: usage1 });
  assert.equal(s.usage.inputTokens, 100);
  s = applyEvent(s, { t: 5000, type: "usage", turn: 3, usage: usage2 });
  // Should replace, not add
  assert.equal(s.usage.inputTokens, 300);
  assert.equal(s.usage.turns, 3);
});

test("alert appends and stalled sets health=stalled unless health is error", () => {
  // Sub-case 1: stalled when health is active
  const alert1 = { kind: "stalled" as const, at: 5000, message: "No events for 120s" };
  const s = applyEvent(snap({ health: "active" }), { t: 5000, type: "alert", alert: alert1 });
  assert.equal(s.alerts.length, 1);
  assert.equal(s.health, "stalled");

  // Sub-case 2: stalled when health is already error → stays error
  const alert2 = { kind: "stalled" as const, at: 6000, message: "No events for 240s" };
  const s2 = applyEvent(snap({ health: "error" }), { t: 6000, type: "alert", alert: alert2 });
  assert.equal(s2.alerts.length, 1);
  assert.equal(s2.health, "error");

  // Sub-case 3: a successful tool_end after error recovers health
  const s3 = applyEvent(s2, {
    t: 7000,
    type: "tool_end",
    toolCallId: "tc-r",
    toolName: "bash",
    isError: false,
    durationMs: 10,
  });
  assert.equal(s3.health, "active");
});

test("stopped with reason=completed sets phase=done and exitCode", () => {
  const prev = snap({ phase: "agent" });
  const s = applyEvent(prev, { t: 9000, type: "stopped", exitCode: 0, reason: "completed" });
  assert.equal(s.phase, "done");
  assert.equal(s.exitCode, 0);
});

test("stopped with reason=killed sets phase=failed even if previous phase was done", () => {
  const prev = snap({ phase: "done" });
  const s = applyEvent(prev, { t: 9000, type: "stopped", exitCode: 137, reason: "killed" });
  assert.equal(s.phase, "failed");
  assert.equal(s.exitCode, 137);
});

// ─── consecutiveToolErrors & health recovery ─────────────────────────────────

test("emptySnapshot returns consecutiveToolErrors === 0", () => {
  const s = emptySnapshot("t", 0);
  assert.equal(s.consecutiveToolErrors, 0);
});

test("tool_end isError:false after isError:true recovers health and resets counter", () => {
  let s = snap({ phase: "agent" });
  s = applyEvent(s, { t: 1000, type: "tool_start", toolCallId: "tc-1", toolName: "bash", argsPreview: "bad" });
  s = applyEvent(s, {
    t: 1100,
    type: "tool_end",
    toolCallId: "tc-1",
    toolName: "bash",
    isError: true,
    durationMs: 100,
  });
  assert.equal(s.health, "error");
  assert.equal(s.consecutiveToolErrors, 1);

  s = applyEvent(s, { t: 1200, type: "tool_start", toolCallId: "tc-2", toolName: "bash", argsPreview: "ok" });
  s = applyEvent(s, {
    t: 1300,
    type: "tool_end",
    toolCallId: "tc-2",
    toolName: "bash",
    isError: false,
    durationMs: 100,
  });
  assert.equal(s.health, "active");
  assert.equal(s.consecutiveToolErrors, 0);
});

test("three consecutive tool_end isError:true ⇒ consecutiveToolErrors === 3", () => {
  let s = snap({ phase: "agent" });
  for (let i = 0; i < 3; i++) {
    s = applyEvent(s, {
      t: 1000 + i * 100,
      type: "tool_start",
      toolCallId: `tc-${i}`,
      toolName: "bash",
      argsPreview: "fail",
    });
    s = applyEvent(s, {
      t: 1050 + i * 100,
      type: "tool_end",
      toolCallId: `tc-${i}`,
      toolName: "bash",
      isError: true,
      durationMs: 50,
    });
  }
  assert.equal(s.consecutiveToolErrors, 3);
  assert.equal(s.health, "error");
});

test("three consecutive errors then one success ⇒ reset", () => {
  let s = snap({ phase: "agent" });
  for (let i = 0; i < 3; i++) {
    s = applyEvent(s, {
      t: 1000 + i * 100,
      type: "tool_start",
      toolCallId: `tc-${i}`,
      toolName: "bash",
      argsPreview: "fail",
    });
    s = applyEvent(s, {
      t: 1050 + i * 100,
      type: "tool_end",
      toolCallId: `tc-${i}`,
      toolName: "bash",
      isError: true,
      durationMs: 50,
    });
  }
  s = applyEvent(s, { t: 2000, type: "tool_start", toolCallId: "tc-ok", toolName: "bash", argsPreview: "ok" });
  s = applyEvent(s, {
    t: 2050,
    type: "tool_end",
    toolCallId: "tc-ok",
    toolName: "bash",
    isError: false,
    durationMs: 50,
  });
  assert.equal(s.consecutiveToolErrors, 0);
  assert.equal(s.health, "active");
});

test("assistant_text after failing tool_end resets counter and recovers health", () => {
  let s = snap({ phase: "agent" });
  s = applyEvent(s, { t: 1000, type: "tool_start", toolCallId: "tc-1", toolName: "bash", argsPreview: "fail" });
  s = applyEvent(s, {
    t: 1100,
    type: "tool_end",
    toolCallId: "tc-1",
    toolName: "bash",
    isError: true,
    durationMs: 100,
  });
  assert.equal(s.consecutiveToolErrors, 1);
  assert.equal(s.health, "error");

  s = applyEvent(s, { t: 1200, type: "assistant_text", preview: "I see the error" });
  assert.equal(s.consecutiveToolErrors, 0);
  assert.equal(s.health, "active");
});

test("usage event after stalled health recovers to active", () => {
  const usage = {
    inputTokens: 100,
    outputTokens: 50,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    costUsd: 0.01,
    contextTokens: 200,
    turns: 1,
  };
  let s = snap({ health: "stalled", consecutiveToolErrors: 2 });
  s = applyEvent(s, { t: 5000, type: "usage", turn: 1, usage });
  assert.equal(s.health, "active");
  assert.equal(s.consecutiveToolErrors, 0);
});

test("stopped with exitCode:0 does not flip active to error", () => {
  const s = applyEvent(snap({ health: "active", phase: "agent" }), {
    t: 9000,
    type: "stopped",
    exitCode: 0,
    reason: "completed",
  });
  assert.equal(s.health, "active");
});

test("stopped with exitCode:2 sets health=error (terminal)", () => {
  const s = applyEvent(snap({ phase: "agent" }), {
    t: 9000,
    type: "stopped",
    exitCode: 2,
    reason: "error",
    errorMessage: "crash",
  });
  assert.equal(s.health, "error");
});

test("every applyEvent branch updates lastEventAt", () => {
  const events: ProgressEvent[] = [
    { t: 1001, type: "phase_change", from: "starting", to: "agent" },
    { t: 1002, type: "turn_start" },
    { t: 1003, type: "tool_start", toolCallId: "tc-1", toolName: "bash", argsPreview: "ls" },
    { t: 1004, type: "tool_end", toolCallId: "tc-1", toolName: "bash", isError: false, durationMs: 1 },
    { t: 1005, type: "assistant_text", preview: "hi" },
    {
      t: 1006,
      type: "usage",
      turn: 1,
      usage: {
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
        costUsd: 0,
        contextTokens: 0,
        turns: 1,
      },
    },
    { t: 1007, type: "alert", alert: { kind: "stalled", at: 1007, message: "stall" } },
    { t: 1008, type: "stopped", exitCode: 0, reason: "completed" },
  ];
  for (const ev of events) {
    const s = applyEvent(snap(), ev);
    assert.equal(s.lastEventAt, ev.t, `lastEventAt not updated for event type: ${ev.type}`);
  }
});
