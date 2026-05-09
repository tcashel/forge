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
// minimal SSE event splitter on top of `Response.body`. The stream emits
// three event types per turn:
//   - `event: delta`  data: {"text": "..."}        — incremental output
//   - `event: done`   data: {"messageId","fullText"} — final ack
//   - `event: error`  data: {"message": "..."}     — fatal failure
//
// Listeners get fine-grained callbacks; the returned promise resolves
// after the stream closes (regardless of done/error). Callers pass an
// `AbortSignal` to cancel — it triggers the underlying `fetch` abort,
// which the server interprets as "kill the spawned claude".

export interface ChatStreamListeners {
  onDelta: (text: string) => void;
  onDone: (final: { messageId: string; fullText: string }) => void;
  onError: (message: string) => void;
}

export interface StartChatStreamOptions {
  url: string;
  body: { message: string; model?: string };
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
      if (evt.event === "delta") {
        try {
          const parsed = JSON.parse(evt.data) as { text?: string };
          if (typeof parsed.text === "string") listeners.onDelta(parsed.text);
        } catch {
          /* skip malformed frame */
        }
      } else if (evt.event === "done") {
        try {
          const parsed = JSON.parse(evt.data) as { messageId?: string; fullText?: string };
          listeners.onDone({ messageId: parsed.messageId ?? "", fullText: parsed.fullText ?? "" });
        } catch {
          /* still treat as done with empty payload */
          listeners.onDone({ messageId: "", fullText: "" });
        }
      } else if (evt.event === "error") {
        try {
          const parsed = JSON.parse(evt.data) as { message?: string };
          listeners.onError(parsed.message || "stream error");
        } catch {
          listeners.onError("stream error");
        }
      }
    }
  } catch (e) {
    if (signal?.aborted) return;
    listeners.onError(e instanceof Error ? e.message : String(e));
  }
}
