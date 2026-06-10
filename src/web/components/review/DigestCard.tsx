import { useEffect } from "preact/hooks";
import { openSessionLogStream } from "../../lib/sse";
import {
  activeDigestSession,
  digestError,
  loadPrDigest,
  prDigest,
  prDigestLoading,
  startPrDigest,
} from "../../signals/review";
import type { PrReviewBundle } from "../../types";
import { MarkdownViewer } from "../MarkdownViewer";
import { timeAgo } from "../prs/pr-format";

interface Props {
  bundle: PrReviewBundle;
  repoRoot: string;
}

/**
 * AI digest of what the PR does — top of the Description tab. Manual trigger
 * (a digest is a full agent pass over the diff; auto-running it on every PR
 * open would burn tokens on PRs the operator only glances at), cached by head
 * SHA with a stale badge + Regenerate once new commits land.
 */
export function DigestCard({ bundle, repoRoot }: Props) {
  const prNum = bundle.pr.number;
  const digest = prDigest.value;
  const session = activeDigestSession.value;
  // PR numbers collide across repos — a digest running for repo A's #7 must
  // not read as "digesting…" on repo B's #7.
  const running = session !== null && session.prNum === prNum && session.repoRoot === repoRoot && session.done !== true;
  const err = digestError.value;

  // While a digest worker runs, subscribe to its log stream just for the
  // `done` event, then reload the digest. The one-line status here replaces
  // the ReviewSessionDrawer — a digest has no findings to triage mid-run.
  useEffect(() => {
    if (!running || !session) return;
    const src = openSessionLogStream(session.sessionId, 0, {
      onLines: () => {},
      onDone: (e) => {
        activeDigestSession.value = { ...session, done: true };
        if (e.exitCode === 0) {
          void loadPrDigest(prNum, repoRoot);
        } else {
          digestError.value = e.error ?? "Digest failed — see the session log.";
        }
      },
      onDisconnect: () => {
        // Stream dropped (server restart, proxy timeout) — refetch; the
        // worker may well have finished.
        activeDigestSession.value = { ...session, done: true };
        void loadPrDigest(prNum, repoRoot);
      },
    });
    return () => {
      try {
        src.close();
      } catch {
        /* noop */
      }
    };
  }, [running, session?.sessionId]);

  const stale = digest !== null && !!bundle.pr.headRefOid && digest.headSha !== bundle.pr.headRefOid;

  const onGenerate = () => {
    void startPrDigest(prNum, repoRoot);
  };

  return (
    <section class="review-digest">
      <header class="review-digest-header">
        <h3>Forge digest</h3>
        {digest ? (
          <span class="review-digest-meta">
            generated {timeAgo(digest.generatedAt)} ago
            {digest.headSha ? ` · ${digest.headSha.slice(0, 7)}` : ""}
          </span>
        ) : null}
        {stale ? <span class="review-digest-stale">outdated — new commits</span> : null}
        {running ? (
          <span class="review-digest-running">digesting…</span>
        ) : (
          <button type="button" class="btn btn-secondary btn-sm" onClick={onGenerate} disabled={prDigestLoading.value}>
            {digest ? (stale ? "Regenerate" : "Refresh digest") : "Generate digest"}
          </button>
        )}
      </header>
      {err ? <p class="review-tab-empty error">{err}</p> : null}
      {digest ? (
        <MarkdownViewer markdown={digest.markdown} class="review-md" />
      ) : running ? (
        <p class="review-tab-empty">The digest agent is reading the PR — this usually takes a minute or two.</p>
      ) : (
        <p class="review-tab-empty">
          No digest yet. Generate one to get an AI orientation: purpose, key changes, risk notes, and a suggested review
          order.
        </p>
      )}
    </section>
  );
}
