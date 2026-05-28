import { useEffect } from "preact/hooks";
import { enterPrMode } from "../../lib/modes";
import { loadReviewBundle, reviewBundle, reviewError, reviewLoading } from "../../signals/review";
import { currentReviewPrNumber, currentReviewRepo } from "../../signals/ui";
import { BatchBar } from "./BatchBar";
import { DiffPane } from "./DiffPane";
import { ReviewActionBar } from "./ReviewActionBar";
import { ReviewHeader } from "./ReviewHeader";
import { UnanchoredComments } from "./UnanchoredComments";

export function ReviewPage() {
  const num = currentReviewPrNumber.value;
  const repo = currentReviewRepo.value;
  const bundle = reviewBundle.value;
  const loading = reviewLoading.value;
  const err = reviewError.value;

  useEffect(() => {
    if (num != null && repo != null) void loadReviewBundle(num, repo);
  }, [num, repo]);

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
          <UnanchoredComments bundle={bundle} />
        </>
      ) : null}
      <BatchBar />
    </div>
  );
}
