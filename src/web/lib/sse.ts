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
