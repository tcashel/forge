// EventSource wrapper for the task log endpoint. Replaces legacy
// `log-stream.js` plus the inline SSE wiring in app.js' renderLogTab().
//
// The wrapper exposes a small lifecycle that the LogTab component can
// drive via useEffect: open(), close(), and an onError reconnect hook.
// The `snapshot` and `append` events both carry log text we forward to
// the consumer's appendLines callback verbatim — line splitting and
// classification stays in the component (so DOM mutations live there).

export interface LogStreamHandlers {
  onLines: (text: string) => void;
  onDisconnect?: () => void;
}

export function openLogStream(taskId: string, lines: number, handlers: LogStreamHandlers): EventSource {
  const url = `/api/tasks/${encodeURIComponent(taskId)}/log?lines=${lines}`;
  const src = new EventSource(url);
  src.addEventListener("snapshot", (e) => handlers.onLines((e as MessageEvent).data));
  src.addEventListener("append", (e) => handlers.onLines((e as MessageEvent).data));
  src.addEventListener("error", () => {
    handlers.onDisconnect?.();
    try {
      src.close();
    } catch {
      // noop
    }
  });
  return src;
}

// ─── Chat SSE (POST + streamed response) ────────────────────────────────────
// EventSource is GET-only, so the planner-chat endpoints (which POST a
// JSON body) need a manual fetch + ReadableStream parser. We implement a
// minimal SSE event splitter on top of `Response.body`. The server emits
// the following event vocabulary per turn:
//   - `event: meta`        data: {sessionId, model, cwd, tools}
//   - `event: text`        data: {blockId, text, append}
//   - `event: tool_use`    data: {toolUseId, name, input}
//   - `event: tool_result` data: {toolUseId, output, isError, truncated}
//   - `event: rate_limit`  data: {status, resetsAt}
//   - `event: done`        data: {messageId, fullText, durationMs?, totalCostUsd?, numTurns?}
//   - `event: error`       data: {message}
//
// Listeners get fine-grained callbacks; the returned promise resolves
// after the stream closes (regardless of done/error). Callers pass an
// `AbortSignal` to cancel — it triggers the underlying `fetch` abort,
// which the server interprets as "kill the spawned claude".

export interface ChatMeta {
  sessionId: string | null;
  model: string | null;
  cwd: string | null;
  tools: string[];
}
export interface ChatTextEvent {
  blockId: string;
  text: string;
  append: boolean;
}
export interface ChatToolUseEvent {
  toolUseId: string;
  name: string;
  input: unknown;
}
export interface ChatToolResultEvent {
  toolUseId: string;
  output: string;
  isError: boolean;
  truncated: boolean;
}
export interface ChatRateLimit {
  status: string | null;
  resetsAt: number | null;
}
export interface ChatDoneEvent {
  messageId: string;
  fullText: string;
  durationMs: number | null;
  totalCostUsd: number | null;
  numTurns: number | null;
}

export interface ChatStreamListeners {
  /** Back-compat alias receiving the latest text snapshot for callers that
   *  don't care about block boundaries. Invoked alongside `onTextDelta`
   *  with the full current text of the active block. */
  onDelta?: (text: string) => void;
  onMeta?: (meta: ChatMeta) => void;
  onTextDelta?: (e: ChatTextEvent) => void;
  onToolUse?: (e: ChatToolUseEvent) => void;
  onToolResult?: (e: ChatToolResultEvent) => void;
  onRateLimit?: (e: ChatRateLimit) => void;
  onDone: (final: ChatDoneEvent) => void;
  onError: (message: string) => void;
}

export interface StartChatStreamOptions {
  url: string;
  /**
   * Body forwarded to the planner-chat endpoint. `repoRoot` is the
   * absolute path of the selected repo — required for the draft scope
   * (no task record exists yet); for the spec scope the server already
   * resolves it from the task and the field is optional.
   */
  body: { message: string; model?: string; repoRoot?: string };
  signal?: AbortSignal;
  listeners: ChatStreamListeners;
}

interface SseEvent {
  event: string;
  data: string;
}

/** Yield SSE events from a UTF-8 chunk stream. Buffers across chunks
 *  so partial events split mid-frame are reassembled cleanly. */
async function* parseSseStream(stream: ReadableStream<Uint8Array>): AsyncGenerator<SseEvent> {
  const reader = stream.getReader();
  const dec = new TextDecoder();
  let buf = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      // SSE frames are separated by a blank line (\n\n). Process each
      // complete frame, leave any partial trailing frame in the buffer.
      let idx: number = buf.indexOf("\n\n");
      while (idx !== -1) {
        const frame = buf.slice(0, idx);
        buf = buf.slice(idx + 2);
        const parsed = parseFrame(frame);
        if (parsed) yield parsed;
        idx = buf.indexOf("\n\n");
      }
    }
    // Flush any remaining frame the server never terminated.
    if (buf.trim().length > 0) {
      const parsed = parseFrame(buf);
      if (parsed) yield parsed;
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {
      /* noop */
    }
  }
}

function parseFrame(frame: string): SseEvent | null {
  let event = "message";
  const dataLines: string[] = [];
  for (const raw of frame.split("\n")) {
    if (!raw || raw.startsWith(":")) continue;
    const colon = raw.indexOf(":");
    const field = colon === -1 ? raw : raw.slice(0, colon);
    let value = colon === -1 ? "" : raw.slice(colon + 1);
    if (value.startsWith(" ")) value = value.slice(1);
    if (field === "event") event = value;
    else if (field === "data") dataLines.push(value);
  }
  if (dataLines.length === 0) return null;
  return { event, data: dataLines.join("\n") };
}

export async function startChatStream(opts: StartChatStreamOptions): Promise<void> {
  const { url, body, signal, listeners } = opts;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "text/event-stream" },
      body: JSON.stringify(body),
      signal,
    });
  } catch (e) {
    // Aborts surface as DOMException name=AbortError; treat as silent close.
    if (signal?.aborted) return;
    listeners.onError(e instanceof Error ? e.message : String(e));
    return;
  }
  if (!res.ok || !res.body) {
    let msg = `chat request failed: HTTP ${res.status}`;
    try {
      const text = await res.text();
      if (text) msg = `${msg} — ${text.slice(0, 200)}`;
    } catch {
      /* noop */
    }
    listeners.onError(msg);
    return;
  }
  try {
    for await (const evt of parseSseStream(res.body)) {
      dispatchChatEvent(evt, listeners);
    }
  } catch (e) {
    if (signal?.aborted) return;
    listeners.onError(e instanceof Error ? e.message : String(e));
  }
}

function safeParse<T>(data: string): T | null {
  try {
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

/**
 * Map a single SSE frame onto the typed listener vocabulary. Exported so
 * unit tests can drive it directly with a captured fixture without
 * spinning up a fetch / ReadableStream.
 */
export function dispatchChatEvent(evt: SseEvent, listeners: ChatStreamListeners): void {
  if (evt.event === "meta") {
    const parsed = safeParse<Partial<ChatMeta>>(evt.data);
    if (!parsed) return;
    listeners.onMeta?.({
      sessionId: typeof parsed.sessionId === "string" ? parsed.sessionId : null,
      model: typeof parsed.model === "string" ? parsed.model : null,
      cwd: typeof parsed.cwd === "string" ? parsed.cwd : null,
      tools: Array.isArray(parsed.tools) ? parsed.tools.filter((t): t is string => typeof t === "string") : [],
    });
  } else if (evt.event === "text") {
    const parsed = safeParse<Partial<ChatTextEvent>>(evt.data);
    if (!parsed || typeof parsed.text !== "string") return;
    const ev: ChatTextEvent = {
      blockId: typeof parsed.blockId === "string" ? parsed.blockId : "",
      text: parsed.text,
      append: parsed.append === true,
    };
    listeners.onTextDelta?.(ev);
    listeners.onDelta?.(ev.text);
  } else if (evt.event === "tool_use") {
    const parsed = safeParse<Partial<ChatToolUseEvent>>(evt.data);
    if (!parsed || typeof parsed.toolUseId !== "string" || typeof parsed.name !== "string") return;
    listeners.onToolUse?.({ toolUseId: parsed.toolUseId, name: parsed.name, input: parsed.input });
  } else if (evt.event === "tool_result") {
    const parsed = safeParse<Partial<ChatToolResultEvent>>(evt.data);
    if (!parsed || typeof parsed.toolUseId !== "string") return;
    listeners.onToolResult?.({
      toolUseId: parsed.toolUseId,
      output: typeof parsed.output === "string" ? parsed.output : "",
      isError: parsed.isError === true,
      truncated: parsed.truncated === true,
    });
  } else if (evt.event === "rate_limit") {
    const parsed = safeParse<Partial<ChatRateLimit>>(evt.data);
    if (!parsed) return;
    listeners.onRateLimit?.({
      status: typeof parsed.status === "string" ? parsed.status : null,
      resetsAt: typeof parsed.resetsAt === "number" ? parsed.resetsAt : null,
    });
  } else if (evt.event === "done") {
    const parsed = safeParse<Partial<ChatDoneEvent>>(evt.data);
    listeners.onDone({
      messageId: typeof parsed?.messageId === "string" ? parsed.messageId : "",
      fullText: typeof parsed?.fullText === "string" ? parsed.fullText : "",
      durationMs: typeof parsed?.durationMs === "number" ? parsed.durationMs : null,
      totalCostUsd: typeof parsed?.totalCostUsd === "number" ? parsed.totalCostUsd : null,
      numTurns: typeof parsed?.numTurns === "number" ? parsed.numTurns : null,
    });
  } else if (evt.event === "error") {
    const parsed = safeParse<{ message?: string }>(evt.data);
    listeners.onError(parsed?.message || "stream error");
  } else if (evt.event === "delta") {
    // Legacy event name (pre-stream-json). Forward to onDelta for any
    // caller still reading from older servers.
    const parsed = safeParse<{ text?: string }>(evt.data);
    if (parsed && typeof parsed.text === "string") listeners.onDelta?.(parsed.text);
  }
}

export type { SseEvent };
