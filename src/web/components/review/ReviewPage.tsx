import { useEffect, useMemo } from "preact/hooks";
import { type DiffFile, parseUnifiedDiff } from "../../lib/diff";
import { enterPrMode } from "../../lib/modes";
import {
  clearSelectedReviewRun,
  displayedFindings,
  loadReviewBundle,
  loadReviewRuns,
  reviewBundle,
  reviewError,
  reviewLoading,
} from "../../signals/review";
import { currentReviewPrNumber, currentReviewRepo } from "../../signals/ui";
import type { ForgeFinding } from "../../types";
import { BatchBar } from "./BatchBar";
import { anchorFindings, DiffPane } from "./DiffPane";
import { OutsideDiffFindings } from "./OutsideDiffFindings";
import { ReviewActionBar } from "./ReviewActionBar";
import { ReviewHeader } from "./ReviewHeader";
import { ReviewHistoryPicker } from "./ReviewHistoryPicker";
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
  const findings = displayedFindings.value;

  useEffect(() => {
    if (num != null && repo != null) {
      // Switching PR/repo or remounting the page: drop any prior run
      // selection so the new PR opens on its bundle defaults.
      clearSelectedReviewRun();
      void loadReviewBundle(num, repo);
      void loadReviewRuns(num, repo);
    }
  }, [num, repo]);

  const outsideFindings = useMemo(() => {
    if (!bundle) return [];
    const parsed = parseUnifiedDiff(bundle.diff);
    return deriveOutside(parsed, findings);
  }, [bundle, findings]);

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
      <ReviewHistoryPicker prNumber={num} repoRoot={repo} />
      {loading && !bundle ? <div class="review-status">Loading PR review bundle…</div> : null}
      {err ? <div class="review-status error">{err}</div> : null}
      {bundle ? (
        <>
          <ReviewHeader bundle={bundle} />
          <DiffPane bundle={bundle} findings={findings} />
          <OutsideDiffFindings findings={outsideFindings} />
          <UnanchoredComments bundle={bundle} />
        </>
      ) : null}
      <BatchBar prNumber={num} repoRoot={repo} />
      <ReviewSessionDrawer prNumber={num} repoRoot={repo} />
    </div>
  );
}
