// Compact disclosure for a single tool_use + (optional) tool_result pair.
// Shown inline in an assistant message so the user can see what the
// planner is doing — Read this file, Grep that pattern, run a Bash
// command — without drowning in raw transcripts. Click to expand the
// full input/output JSON; collapsed by default.

import type { ChatBlock } from "../../types";

interface ChatToolCardProps {
  use: Extract<ChatBlock, { type: "tool_use" }>;
  result: Extract<ChatBlock, { type: "tool_result" }> | null;
}

/**
 * Derive a short single-line summary from the tool input. Common tools
 * have predictable input shapes; everything else falls back to a clipped
 * JSON dump.
 */
export function summarizeToolInput(name: string, input: unknown): string {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    return clip(JSON.stringify(input ?? null));
  }
  const rec = input as Record<string, unknown>;
  const pick = (k: string): string | null => (typeof rec[k] === "string" ? (rec[k] as string) : null);
  switch (name) {
    case "Read":
      return pick("file_path") ?? clip(JSON.stringify(rec));
    case "Edit":
    case "Write":
    case "NotebookEdit":
      return pick("file_path") ?? clip(JSON.stringify(rec));
    case "Grep": {
      const pat = pick("pattern");
      const path = pick("path");
      return pat ? (path ? `${pat}  in  ${path}` : pat) : clip(JSON.stringify(rec));
    }
    case "Glob":
      return pick("pattern") ?? clip(JSON.stringify(rec));
    case "Bash":
      return pick("command") ?? clip(JSON.stringify(rec));
    case "WebFetch":
      return pick("url") ?? clip(JSON.stringify(rec));
    case "WebSearch":
      return pick("query") ?? clip(JSON.stringify(rec));
    case "Task":
    case "TaskCreate":
    case "TaskUpdate":
      return pick("description") ?? pick("subagent_type") ?? clip(JSON.stringify(rec));
    default:
      return clip(JSON.stringify(rec));
  }
}

function clip(s: string, max = 80): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

export function ChatToolCard({ use, result }: ChatToolCardProps) {
  const summary = summarizeToolInput(use.name, use.input);
  const status = result ? (result.isError ? "error" : "ok") : "running";
  return (
    <details class={`chat-tool-card status-${status}`}>
      <summary>
        <span class="chat-tool-icon" aria-hidden="true">
          {status === "running" ? <span class="chat-tool-spinner" /> : status === "ok" ? "✓" : "!"}
        </span>
        <span class="chat-tool-name">{use.name}</span>
        <span class="chat-tool-summary">{summary}</span>
      </summary>
      <div class="chat-tool-body">
        <div class="chat-tool-section">
          <div class="chat-tool-section-label">Input</div>
          <pre class="chat-tool-pre">{safeStringify(use.input)}</pre>
        </div>
        {result ? (
          <div class="chat-tool-section">
            <div class="chat-tool-section-label">
              Output{result.truncated ? <span class="chat-tool-trunc"> · truncated</span> : null}
            </div>
            <pre class="chat-tool-pre">{result.output || "(empty)"}</pre>
          </div>
        ) : null}
      </div>
    </details>
  );
}

function safeStringify(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}
