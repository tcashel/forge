import { useState } from "preact/hooks";
import { approvePr, markPrReady, prActionPending } from "../../signals/review";
import type { PrView } from "../../types";

interface Props {
  pr: PrView;
  repoRoot: string;
}

/**
 * PR lifecycle controls — distinct from ReviewActionBar, which drives Forge
 * review runs; these act on the PR's GitHub state. Rendered as one segmented
 * cluster (shared frame, internal dividers) so the group reads as a single
 * "PR state" unit rather than another row of standalone buttons competing
 * with the review workflow bar. gh policy errors (e.g. self-approval)
 * surface inline rather than being pre-gated.
 */
export function PrControls({ pr, repoRoot }: Props) {
  const pending = prActionPending.value;
  const [actionError, setActionError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setActionError(null);
    try {
      await fn();
    } catch (e) {
      const err = e as { message?: string; hint?: string | null };
      setActionError(err.hint ? `${err.message ?? "error"} — ${err.hint}` : (err.message ?? "Action failed."));
    }
  };

  const onCopyBranch = async () => {
    try {
      await navigator.clipboard.writeText(pr.headRefName);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setActionError("Could not copy to clipboard.");
    }
  };

  return (
    <div class="review-pr-controls">
      <div class="review-seg-group">
        {pr.isDraft ? (
          <button
            type="button"
            class="seg accent"
            disabled={pending !== null}
            onClick={() => void run(() => markPrReady(pr.number, repoRoot))}
            title="Mark this draft PR ready for review (gh pr ready)"
          >
            {pending === "ready" ? "Marking ready…" : "Ready for review"}
          </button>
        ) : null}
        <button
          type="button"
          class="seg"
          disabled={pending !== null}
          onClick={() => void run(() => approvePr(pr.number, repoRoot))}
          title="Submit an approving review (gh pr review --approve)"
        >
          {pending === "approve" ? "Approving…" : "Approve"}
        </button>
        <button
          type="button"
          class="seg"
          onClick={() => void onCopyBranch()}
          title={`Copy branch name: ${pr.headRefName}`}
        >
          {copied ? "Copied!" : "Copy branch"}
        </button>
        {pr.url ? (
          <a class="seg" href={pr.url} target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
        ) : null}
      </div>
      {actionError ? <span class="review-pr-controls-error">{actionError}</span> : null}
    </div>
  );
}
