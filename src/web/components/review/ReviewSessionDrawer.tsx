import { useEffect, useRef, useState } from "preact/hooks";
import { openSessionLogStream } from "../../lib/sse";
import { activeReviewSession, loadReviewBundle } from "../../signals/review";

interface Props {
  prNumber: number;
  repoRoot: string;
}

/**
 * Right-side slide-in panel that streams the running ad-hoc reviewer's
 * log. Subscribes via openSessionLogStream; closes on Escape or the X
 * button. When the worker fires `done`, the drawer refetches the PR
 * review bundle so newly written forge findings show up immediately,
 * then clears activeReviewSession.
 *
 * Mirrors the same single-subscription pattern as the existing LogTab —
 * one EventSource per mount, torn down in the cleanup return.
 */
export function ReviewSessionDrawer({ prNumber, repoRoot }: Props) {
  const session = activeReviewSession.value;
  const open = session !== null && session.prNum === prNumber;
  const [lines, setLines] = useState<string>("");
  const [terminalState, setTerminalState] = useState<"running" | "done" | "failed">("running");
  const [closeError, setCloseError] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  const onClose = () => {
    activeReviewSession.value = null;
  };

  useEffect(() => {
    if (!open || !session) return undefined;
    setLines("");
    setTerminalState("running");
    setCloseError(null);
    const src = openSessionLogStream(session.sessionId, 200, {
      onLines: (text) => {
        setLines((prev) => (prev ? `${prev}\n${text}` : text));
      },
      onDone: (e) => {
        setTerminalState(e.exitCode === 0 ? "done" : "failed");
        setCloseError(e.error);
        // Re-fetch the bundle so newly-written findings appear inline.
        void loadReviewBundle(prNumber, repoRoot);
        // Clear the active session regardless of success/failure —
        // the drawer can be closed independently and re-opened by
        // clicking Run Forge review again.
        activeReviewSession.value = null;
      },
      onError: () => {
        setCloseError("log stream interrupted");
      },
    });
    return () => {
      try {
        src.close();
      } catch {
        /* noop */
      }
    };
    // We intentionally re-key on sessionId so a new review session
    // gets a fresh subscription.
  }, [open, session?.sessionId, prNumber, repoRoot]);

  useEffect(() => {
    if (!open) return undefined;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  // Auto-scroll the body to the bottom as lines come in.
  useEffect(() => {
    if (!open) return;
    const el = bodyRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [lines, open]);

  if (!open || !session) return null;

  return (
    <aside class="review-session-drawer" role="dialog" aria-label="Forge review session">
      <header class="review-session-drawer-header">
        <div class="review-session-drawer-title">
          Forge review · PR #{session.prNum}
          <span class={`review-session-drawer-state state-${terminalState}`}>
            {terminalState === "running" ? "running…" : terminalState === "done" ? "done" : "failed"}
          </span>
        </div>
        <button type="button" class="btn btn-ghost" onClick={onClose} aria-label="Close review log drawer">
          ✕
        </button>
      </header>
      {closeError ? <div class="review-status error">{closeError}</div> : null}
      <div ref={bodyRef} class="review-session-drawer-body">
        <pre>{lines || "(waiting for output…)"}</pre>
      </div>
    </aside>
  );
}
