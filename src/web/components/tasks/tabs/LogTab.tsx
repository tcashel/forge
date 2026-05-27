import { useEffect, useRef, useState } from "preact/hooks";
import { copyCmd } from "../../../lib/actions";
import { openLogStream } from "../../../lib/sse";
import type { PlanView } from "../../../types";

function classifyLogLine(line: string): string {
  if (/✗|✘|FAIL|error|fatal|exit 1|\bERR\b/i.test(line)) return "err";
  if (/✓|✔|PASS|✅|\bOK\b|done\./i.test(line)) return "ok";
  if (/⚠|warn(ing)?\b/i.test(line)) return "warn";
  if (/^\$\s/.test(line) || /^>>>/.test(line) || /^═/.test(line)) return "info";
  return "dim";
}

function appendLogLines(box: HTMLElement, text: string) {
  if (!text) return;
  const wasAtBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 60;
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    if (line === "" && box.lastElementChild && box.lastElementChild.textContent === "") continue;
    const div = document.createElement("div");
    div.className = `line ${classifyLogLine(line)}`;
    div.textContent = line;
    box.appendChild(div);
  }
  while (box.children.length > 5000) box.removeChild(box.firstChild as ChildNode);
  if (wasAtBottom) box.scrollTop = box.scrollHeight;
}

export function LogTab({ t }: { t: PlanView }) {
  const isLive = t.section === "running";
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [disconnected, setDisconnected] = useState(false);
  const [tick, setTick] = useState(0); // bumped by reconnect

  useEffect(() => {
    setDisconnected(false);
    if (!t.hasLog) return;
    const box = boxRef.current;
    if (!box) return;
    // Reset accumulated lines on tab/task change.
    box.innerHTML = "";
    const src = openLogStream(t.id, 400, {
      onLines: (text) => appendLogLines(box, text),
      onDisconnect: () => {
        appendLogLines(box, "(log stream disconnected)");
        setDisconnected(true);
      },
    });
    return () => {
      try {
        src.close();
      } catch {
        // noop
      }
    };
  }, [t.id, t.hasLog, tick]);

  return (
    <>
      <div class="log-toolbar">
        <span class={`toggle ${isLive ? "on" : ""}`}>
          <span class="d" /> {isLive ? "Following live" : "Static (run finished)"}
        </span>
        <button
          type="button"
          class="btn sm btn-ghost"
          id="log-copy-path"
          onClick={() => copyCmd(`~/.forge/runs/${t.id}/agent.log`)}
        >
          Copy log path
        </button>
        {disconnected ? (
          <button
            type="button"
            class="btn sm btn-secondary"
            id="log-reconnect"
            style="margin-left:8px"
            onClick={() => setTick((n) => n + 1)}
          >
            Reconnect
          </button>
        ) : null}
        <span style="margin-left:auto" class="mono">
          ~/.forge/runs/{t.id}/agent.log
        </span>
      </div>
      <div class="log" id="logbox" ref={boxRef}>
        {!t.hasLog ? <div class="line dim">No log file yet — run hasn't started, or it was deleted.</div> : null}
      </div>
    </>
  );
}
