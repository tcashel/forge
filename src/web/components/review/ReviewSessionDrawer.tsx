import { useEffect, useRef, useState } from "preact/hooks";
import { openSessionLogStream } from "../../lib/sse";
import { showToast } from "../../lib/toast";
import { activeCommentFixSession, activeReviewSession, loadReviewBundle, loadReviewRuns } from "../../signals/review";

interface Props {
  prNumber: number;
  repoRoot: string;
}

type Kind = "review" | "comment-fix";

interface ActiveSession {
  kind: Kind;
  sessionId: string;
  prNum: number;
}

/**
 * Right-side slide-in panel that streams either the running ad-hoc
 * reviewer's log or the running comment-fix worker's log. Subscribes via
 * openSessionLogStream; closes on Escape or the X button. When the worker
 * fires `done`, the drawer refetches the PR review bundle + run history so
 * newly-written findings / fix / publish state show up — but it stays
 * mounted (the active-session signal is only stamped `done`, not cleared)
 * so failure text remains readable. Only an explicit close clears the
 * signal; a failed run additionally raises a toast in case the operator
 * already navigated their eyes elsewhere.
 */
export function ReviewSessionDrawer({ prNumber, repoRoot }: Props) {
  const reviewSession = activeReviewSession.value;
  const fixSession = activeCommentFixSession.value;
  const active: ActiveSession | null = fixSession
    ? { kind: "comment-fix", sessionId: fixSession.sessionId, prNum: fixSession.prNum }
    : reviewSession
      ? { kind: "review", sessionId: reviewSession.sessionId, prNum: reviewSession.prNum }
      : null;
  const open = active !== null && active.prNum === prNumber;
  const [lines, setLines] = useState<string>("");
  const [terminalState, setTerminalState] = useState<"running" | "done" | "failed">("running");
  const [closeError, setCloseError] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  const onClose = () => {
    if (active?.kind === "comment-fix") activeCommentFixSession.value = null;
    else activeReviewSession.value = null;
  };

  // Mark the session finished without unmounting the drawer: the signal
  // keeps the session (so the drawer stays open showing the final log +
  // error text) but downstream consumers (ReviewActionBar) stop treating
  // it as running.
  const markDone = (kind: Kind, sessionId: string) => {
    const sig = kind === "comment-fix" ? activeCommentFixSession : activeReviewSession;
    const cur = sig.value;
    if (cur && cur.sessionId === sessionId && cur.done !== true) {
      sig.value = { ...cur, done: true };
    }
  };

  useEffect(() => {
    if (!open || !active) return undefined;
    setLines("");
    setTerminalState("running");
    setCloseError(null);
    const src = openSessionLogStream(active.sessionId, 200, {
      onLines: (text) => {
        setLines((prev) => (prev ? `${prev}\n${text}` : text));
      },
      onDone: (e) => {
        const failed = e.exitCode !== 0 || e.error != null;
        setTerminalState(failed ? "failed" : "done");
        setCloseError(e.error);
        if (failed) {
          const label = active.kind === "comment-fix" ? "Comment fix" : "Forge review";
          showToast(`${label} failed: ${e.error ?? `exit code ${e.exitCode}`}`, "error");
        }
        void loadReviewBundle(prNumber, repoRoot);
        void loadReviewRuns(prNumber, repoRoot);
        markDone(active.kind, active.sessionId);
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
  }, [open, active?.kind, active?.sessionId, prNumber, repoRoot]);

  useEffect(() => {
    if (!open) return undefined;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = bodyRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [lines, open]);

  if (!open || !active) return null;

  const title = active.kind === "comment-fix" ? "Forge comment fix" : "Forge review";

  return (
    <aside class="review-session-drawer" role="dialog" aria-label={`${title} session`}>
      <header class="review-session-drawer-header">
        <div class="review-session-drawer-title">
          {title} · PR #{active.prNum}
          <span class={`review-session-drawer-state state-${terminalState}`}>
            {terminalState === "running" ? "running…" : terminalState === "done" ? "done" : "failed"}
          </span>
        </div>
        <button type="button" class="btn btn-ghost" onClick={onClose} aria-label="Close session log drawer">
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
