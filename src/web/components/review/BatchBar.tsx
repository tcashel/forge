import { useEffect, useState } from "preact/hooks";
import type { ApiError } from "../../lib/api";
import { type FixTarget, parseTargetKey } from "../../lib/review-targets";
import { showToast } from "../../lib/toast";
import { activeCommentFixSession, selectedTargets, setTargetStatuses, startCommentFix } from "../../signals/review";
import type { DroppedFixTarget } from "../../types";

interface Props {
  prNumber: number;
  repoRoot: string;
}

export function BatchBar({ prNumber, repoRoot }: Props) {
  const sel = selectedTargets.value;
  const count = sel.size;
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [dropped, setDropped] = useState<DroppedFixTarget[]>([]);

  // Dropped-target notices are per-PR; don't leak them across a PR switch.
  useEffect(() => {
    setDropped([]);
    setErr(null);
  }, [prNumber, repoRoot]);

  if (count === 0 && dropped.length === 0) return null;

  const onClick = async () => {
    if (submitting) return;
    const tokens = Array.from(sel);
    const targets: FixTarget[] = tokens.map((t) => parseTargetKey(t)).filter((t): t is FixTarget => t !== null);
    if (targets.length === 0) return;
    setSubmitting(true);
    setErr(null);
    setDropped([]);
    try {
      setTargetStatuses(tokens, "fixing");
      const res = await startCommentFix(prNumber, repoRoot, targets);
      activeCommentFixSession.value = { sessionId: res.sessionId, prNum: prNumber };
      // Targets the server could not match never reach the worker — surface
      // each with its reason instead of letting the selection silently
      // shrink, and roll their live status back so they don't show "fixing…".
      const droppedNow = res.droppedTargets ?? [];
      if (droppedNow.length > 0) {
        setDropped(droppedNow);
        setTargetStatuses(
          droppedNow.map((d) => d.token),
          "pending",
        );
        showToast(
          `${droppedNow.length} of ${targets.length} selected target(s) dropped — see the fix panel for reasons.`,
          "error",
        );
      }
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
      {count > 0 ? (
        <>
          <span class="review-batch-count">{count} selected</span>
          <button type="button" class="btn btn-primary" disabled={submitting} onClick={onClick}>
            {submitting ? "Starting…" : `Fix ${count} selected`}
          </button>
        </>
      ) : null}
      {err ? <span class="review-batch-error">{err}</span> : null}
      {dropped.length > 0 ? (
        <ul class="review-batch-dropped">
          {dropped.map((d) => (
            <li key={d.token} class="review-batch-dropped-item">
              <code>{d.token}</code> dropped: {d.reason}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
