import { useEffect, useRef, useState } from "preact/hooks";
import { openSessionLogStream } from "../../lib/sse";
import { activeCommentFixSession, activeReviewSession, loadReviewBundle } from "../../signals/review";

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
 * openSessionLogStream; closes on Escape or the X button. When the
 * worker fires `done`, the drawer refetches the PR review bundle so
 * newly-written findings / fix state show up, then clears the
 * corresponding active-session signal.
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
        setTerminalState(e.exitCode === 0 ? "done" : "failed");
        setCloseError(e.error);
        void loadReviewBundle(prNumber, repoRoot);
        if (active.kind === "comment-fix") activeCommentFixSession.value = null;
        else activeReviewSession.value = null;
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
