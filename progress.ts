/**
 * Forge Progress — structured snapshot types and pure reducer.
 *
 * This module has zero runtime imports. It defines the Snapshot that the
 * supervisor writes to disk and the dashboard reads, plus the event
 * stream that feeds into it.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

export const SCHEMA_VERSION = 1;
export const RECENT_TOOLS_LIMIT = 5;

// ─── Types ────────────────────────────────────────────────────────────────────

export type Phase =
  | "starting"        // supervisor booted, agent not yet spawned
  | "agent"           // agent CLI is running (most events arrive here)
  | "quality_check"   // post-agent quality commands running
  | "committing"      // git add/commit/push
  | "creating_pr"     // gh pr create
  | "done"
  | "failed";

export type Health = "active" | "idle" | "stalled" | "error";

export interface ToolActivity {
  toolCallId: string;
  toolName: string;
  argsPreview: string;     // ≤ 80 chars, single-line
  startedAt: number;       // epoch ms
  endedAt: number | null;
  isError: boolean | null; // null while running
}

export interface UsageTotals {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  costUsd: number;
  contextTokens: number;   // latest assistant message's totalTokens
  turns: number;
}

export type AlertKind = "stalled";   // future: tool_error_loop, context_bloat, runaway_turns

export interface Alert {
  kind: AlertKind;
  at: number;              // epoch ms
  message: string;         // human-readable, ≤ 160 chars
}

export interface Snapshot {
  schemaVersion: 1;
  taskId: string;
  phase: Phase;
  health: Health;
  consecutiveToolErrors: number;
  startedAt: number;
  lastEventAt: number;
  agentPid: number | null;
  currentTool: ToolActivity | null;
  recentTools: ToolActivity[];      // bounded to last 5, oldest → newest
  lastAssistantText: string | null; // ≤ 240 chars, single-line
  usage: UsageTotals;
  alerts: Alert[];                  // sticky; cleared only when supervisor exits
  qualityResults: { command: string; ok: boolean; durationMs: number }[];
  prUrl: string | null;
  exitCode: number | null;          // null while running
  errorMessage: string | null;
}

export type ProgressEvent =
  | { t: number; type: "phase_change"; from: Phase; to: Phase }
  | { t: number; type: "turn_start" }
  | { t: number; type: "tool_start"; toolCallId: string; toolName: string; argsPreview: string }
  | { t: number; type: "tool_end"; toolCallId: string; toolName: string; isError: boolean; durationMs: number }
  | { t: number; type: "assistant_text"; preview: string }
  | { t: number; type: "usage"; turn: number; usage: UsageTotals }
  | { t: number; type: "alert"; alert: Alert }
  | { t: number; type: "stopped"; exitCode: number; reason: "completed" | "killed" | "error"; errorMessage?: string };

// ─── Factory ──────────────────────────────────────────────────────────────────

export function emptySnapshot(taskId: string, startedAt: number): Snapshot {
  return {
    schemaVersion: SCHEMA_VERSION,
    taskId,
    phase: "starting",
    health: "active",
    consecutiveToolErrors: 0,
    startedAt,
    lastEventAt: startedAt,
    agentPid: null,
    currentTool: null,
    recentTools: [],
    lastAssistantText: null,
    usage: {
      inputTokens: 0,
      outputTokens: 0,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      costUsd: 0,
      contextTokens: 0,
      turns: 0,
    },
    alerts: [],
    qualityResults: [],
    prUrl: null,
    exitCode: null,
    errorMessage: null,
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function recover(h: Health): Health {
  return h === "error" || h === "stalled" ? "active" : h;
}

export function applyEvent(prev: Snapshot, ev: ProgressEvent): Snapshot {
  const base = { ...prev, lastEventAt: ev.t };

  switch (ev.type) {
    case "phase_change": {
      let health = base.health;
      if (ev.to === "agent") health = "active";
      return { ...base, phase: ev.to, health };
    }

    case "turn_start":
      return base;

    case "tool_start":
      return {
        ...base,
        currentTool: {
          toolCallId: ev.toolCallId,
          toolName: ev.toolName,
          argsPreview: ev.argsPreview,
          startedAt: ev.t,
          endedAt: null,
          isError: null,
        },
      };

    case "tool_end": {
      const matched = prev.currentTool?.toolCallId === ev.toolCallId;
      const completed: ToolActivity = matched
        ? { ...prev.currentTool!, endedAt: ev.t, isError: ev.isError }
        : {
            toolCallId: ev.toolCallId,
            toolName: ev.toolName,
            argsPreview: "",
            startedAt: ev.t - ev.durationMs,
            endedAt: ev.t,
            isError: ev.isError,
          };
      const recentTools = [...prev.recentTools, completed].slice(-RECENT_TOOLS_LIMIT);
      const consecutiveToolErrors = ev.isError ? prev.consecutiveToolErrors + 1 : 0;
      const health = ev.isError ? ("error" as Health) : recover(base.health);
      return {
        ...base,
        currentTool: matched ? null : base.currentTool,
        recentTools,
        health,
        consecutiveToolErrors,
      };
    }

    case "assistant_text":
      return { ...base, lastAssistantText: ev.preview, consecutiveToolErrors: 0, health: recover(base.health) };

    case "usage":
      return { ...base, usage: { ...ev.usage }, consecutiveToolErrors: 0, health: recover(base.health) };

    case "alert": {
      const alerts = [...prev.alerts, ev.alert];
      let health = base.health;
      if (ev.alert.kind === "stalled" && base.health !== "error") {
        health = "stalled";
      }
      return { ...base, alerts, health };
    }

    case "stopped": {
      let phase = base.phase;
      if (ev.reason === "completed") {
        if (prev.phase !== "failed") phase = "done";
      } else {
        phase = "failed";
      }
      const health = ev.exitCode !== 0 ? "error" as Health : base.health;
      return {
        ...base,
        phase,
        health,
        exitCode: ev.exitCode,
        errorMessage: ev.errorMessage ?? null,
      };
    }
  }
}
