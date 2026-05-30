import { useState } from "preact/hooks";
import type { ApiError } from "../../lib/api";
import { type FixTarget, parseTargetKey } from "../../lib/review-targets";
import { activeCommentFixSession, selectedTargets, setTargetStatuses, startCommentFix } from "../../signals/review";

interface Props {
  prNumber: number;
  repoRoot: string;
}

export function BatchBar({ prNumber, repoRoot }: Props) {
  const sel = selectedTargets.value;
  const count = sel.size;
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (count === 0) return null;

  const onClick = async () => {
    if (submitting) return;
    const tokens = Array.from(sel);
    const targets: FixTarget[] = tokens.map((t) => parseTargetKey(t)).filter((t): t is FixTarget => t !== null);
    if (targets.length === 0) return;
    setSubmitting(true);
    setErr(null);
    try {
      setTargetStatuses(tokens, "fixing");
      const res = await startCommentFix(prNumber, repoRoot, targets);
      activeCommentFixSession.value = { sessionId: res.sessionId, prNum: prNumber };
    } catch (e) {
      const apiErr = e as ApiError;
      setErr(apiErr.hint ? `${apiErr.message} — ${apiErr.hint}` : apiErr.message || "Could not start comment fix.");
      // Roll the status back to pending so the operator can retry.
      setTargetStatuses(tokens, "pending");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div class="review-batch-bar">
      <span class="review-batch-count">{count} selected</span>
      <button type="button" class="btn btn-primary" disabled={submitting} onClick={onClick}>
        {submitting ? "Starting…" : `Fix ${count} selected`}
      </button>
      {err ? <span class="review-batch-error">{err}</span> : null}
    </div>
  );
}
