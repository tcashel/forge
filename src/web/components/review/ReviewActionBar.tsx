import { useState } from "preact/hooks";
import { enterPrMode } from "../../lib/modes";
import { activeReviewSession, loadReviewBundle, publishToGitHub, startAdHocReview } from "../../signals/review";

interface Props {
  prNumber: number;
  repoRoot: string;
  loading: boolean;
}

export function ReviewActionBar({ prNumber, repoRoot, loading }: Props) {
  const onBack = () => enterPrMode();
  const onRefresh = () => {
    void loadReviewBundle(prNumber, repoRoot);
  };
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const activeSession = activeReviewSession.value;
  const reviewRunning = activeSession !== null && activeSession.prNum === prNumber;

  const onRunReview = async () => {
    if (starting || reviewRunning) return;
    setStarting(true);
    setStartError(null);
    try {
      const res = await startAdHocReview(prNumber, repoRoot, { publishToGitHub: publishToGitHub.value });
      activeReviewSession.value = { sessionId: res.sessionId, prNum: prNumber };
    } catch (e) {
      const err = e as { message?: string; hint?: string | null };
      setStartError(err.hint ? `${err.message ?? "error"} — ${err.hint}` : (err.message ?? "Failed to start review."));
    } finally {
      setStarting(false);
    }
  };

  return (
    <div class="review-action-bar">
      <button type="button" class="btn btn-ghost" onClick={onBack}>
        ← Back to PRs
      </button>
      <button type="button" class="btn btn-secondary" disabled={loading} onClick={onRefresh}>
        {loading ? "Refreshing…" : "Refresh"}
      </button>
      <button
        type="button"
        class="btn btn-primary"
        disabled={starting || reviewRunning}
        onClick={onRunReview}
        title={
          reviewRunning ? "A Forge review is already running for this PR." : "Run the Forge reviewer agent on this PR"
        }
      >
        {starting ? "Starting…" : reviewRunning ? "Forge review running…" : "Run Forge review"}
      </button>
      <label class="review-publish-toggle" title="Publish findings to the PR as GitHub review comments.">
        <input
          type="checkbox"
          checked={publishToGitHub.value}
          disabled={starting || reviewRunning}
          onChange={(e) => {
            publishToGitHub.value = (e.target as HTMLInputElement).checked;
          }}
        />
        Publish to PR
      </label>
      {reviewRunning ? <span class="review-running-badge">review running…</span> : null}
      {startError ? (
        <span class="review-status error" style={{ padding: "4px 8px" }}>
          {startError}
        </span>
      ) : null}
    </div>
  );
}
