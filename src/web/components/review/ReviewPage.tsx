import { useEffect, useMemo } from "preact/hooks";
import { type DiffFile, parseUnifiedDiff } from "../../lib/diff";
import { enterPrMode } from "../../lib/modes";
import { loadReviewBundle, reviewBundle, reviewError, reviewLoading } from "../../signals/review";
import { currentReviewPrNumber, currentReviewRepo } from "../../signals/ui";
import type { ForgeFinding } from "../../types";
import { BatchBar } from "./BatchBar";
import { anchorFindings, DiffPane } from "./DiffPane";
import { OutsideDiffFindings } from "./OutsideDiffFindings";
import { ReviewActionBar } from "./ReviewActionBar";
import { ReviewHeader } from "./ReviewHeader";
import { ReviewSessionDrawer } from "./ReviewSessionDrawer";
import { UnanchoredComments } from "./UnanchoredComments";

function deriveOutside(diff: DiffFile[], findings: ForgeFinding[]): ForgeFinding[] {
  return anchorFindings(findings, diff).outside;
}

export function ReviewPage() {
  const num = currentReviewPrNumber.value;
  const repo = currentReviewRepo.value;
  const bundle = reviewBundle.value;
  const loading = reviewLoading.value;
  const err = reviewError.value;

  useEffect(() => {
    if (num != null && repo != null) void loadReviewBundle(num, repo);
  }, [num, repo]);

  const outsideFindings = useMemo(() => {
    if (!bundle) return [];
    const parsed = parseUnifiedDiff(bundle.diff);
    return deriveOutside(parsed, bundle.forgeFindings ?? []);
  }, [bundle]);

  if (num == null || repo == null) {
    return (
      <div class="review-page review-empty">
        <p>No PR selected. Pick a PR from the list to start a review.</p>
        <button type="button" class="btn btn-secondary" onClick={() => enterPrMode()}>
          Back to PRs
        </button>
      </div>
    );
  }

  return (
    <div class="review-page">
      <ReviewActionBar prNumber={num} repoRoot={repo} loading={loading} />
      {loading && !bundle ? <div class="review-status">Loading PR review bundle…</div> : null}
      {err ? <div class="review-status error">{err}</div> : null}
      {bundle ? (
        <>
          <ReviewHeader bundle={bundle} />
          <DiffPane bundle={bundle} />
          <OutsideDiffFindings findings={outsideFindings} />
          <UnanchoredComments bundle={bundle} />
        </>
      ) : null}
      <BatchBar prNumber={num} repoRoot={repo} />
      <ReviewSessionDrawer prNumber={num} repoRoot={repo} />
    </div>
  );
}
