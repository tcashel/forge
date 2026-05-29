import { useState } from "preact/hooks";
import type { ApiError } from "../../lib/api";
import {
  activeCommentFixSession,
  reviewBundle,
  selectedComments,
  setCommentStatuses,
  startCommentFix,
} from "../../signals/review";

interface Props {
  prNumber: number;
  repoRoot: string;
}

export function BatchBar({ prNumber, repoRoot }: Props) {
  const bundle = reviewBundle.value;
  const sel = selectedComments.value;
  const count = sel.size;
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (count === 0) return null;

  const noWorktree = !bundle?.worktreePath;
  const disabledReason = noWorktree ? "no-worktree" : null;

  const onClick = async () => {
    if (submitting || noWorktree) return;
    const ids = Array.from(sel)
      .map((s) => Number.parseInt(s, 10))
      .filter((n) => Number.isFinite(n) && n > 0);
    if (ids.length === 0) return;
    setSubmitting(true);
    setErr(null);
    try {
      setCommentStatuses(ids, "fixing");
      const res = await startCommentFix(prNumber, repoRoot, ids);
      activeCommentFixSession.value = { sessionId: res.sessionId, prNum: prNumber };
    } catch (e) {
      const apiErr = e as ApiError;
      setErr(apiErr.hint ? `${apiErr.message} — ${apiErr.hint}` : apiErr.message || "Could not start comment fix.");
      // Roll the status back to pending so the operator can retry.
      setCommentStatuses(ids, "pending");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div class="review-batch-bar">
      <span class="review-batch-count">{count} selected</span>
      <button
        type="button"
        class="btn btn-primary"
        disabled={submitting || noWorktree}
        data-disabled-reason={disabledReason ?? undefined}
        title={noWorktree ? "This PR has no Forge worktree to fix in" : undefined}
        onClick={onClick}
      >
        {submitting ? "Starting…" : `Fix ${count} selected`}
      </button>
      {err ? <span class="review-batch-error">{err}</span> : null}
    </div>
  );
}
