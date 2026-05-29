import { useEffect, useMemo } from "preact/hooks";
import { parseUnifiedDiff } from "../../lib/diff";
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
import type { ForgeFindingSeverity } from "../../types";
import { BatchBar } from "./BatchBar";
import { anchorFindings, DiffPane } from "./DiffPane";
import { FindingsRail } from "./FindingsRail";
import { IntentPanel } from "./IntentPanel";
import { LeftNav } from "./LeftNav";
import { ReviewActionBar } from "./ReviewActionBar";
import { ReviewHeader } from "./ReviewHeader";
import { ReviewHistoryPicker } from "./ReviewHistoryPicker";
import { ReviewSessionDrawer } from "./ReviewSessionDrawer";
import { UnanchoredComments } from "./UnanchoredComments";

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

  const parsedDiff = useMemo(() => (bundle ? parseUnifiedDiff(bundle.diff) : []), [bundle]);
  const { anchoredFlat, outside } = useMemo(() => {
    if (!bundle) return { anchored: new Map(), anchoredFlat: [], outside: [] };
    return anchorFindings(findings, parsedDiff);
  }, [bundle, findings, parsedDiff]);

  const findingsByFile = useMemo<Map<string, ForgeFindingSeverity>>(() => {
    const rank: Record<ForgeFindingSeverity, number> = { BLOCKER: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    const out = new Map<string, ForgeFindingSeverity>();
    for (const a of anchoredFlat) {
      const cur = out.get(a.finding.file);
      if (!cur || rank[a.finding.severity] < rank[cur]) out.set(a.finding.file, a.finding.severity);
    }
    return out;
  }, [anchoredFlat]);

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
    <div class="review-page review-three-pane">
      {bundle ? <LeftNav files={parsedDiff} findingsByFile={findingsByFile} /> : <aside class="review-nav empty" />}

      <main class="review-center">
        <ReviewActionBar prNumber={num} repoRoot={repo} loading={loading} />
        {loading && !bundle ? <div class="review-status">Loading PR review bundle…</div> : null}
        {err ? <div class="review-status error">{err}</div> : null}
        {bundle ? (
          <>
            <ReviewHeader bundle={bundle} />
            <DiffPane bundle={bundle} findings={findings} />
            <UnanchoredComments bundle={bundle} />
          </>
        ) : null}
      </main>

      <aside class="review-rail">
        <ReviewHistoryPicker prNumber={num} repoRoot={repo} />
        {bundle?.linkedPlanId ? <IntentPanel planId={bundle.linkedPlanId} /> : null}
        {bundle ? <FindingsRail anchored={anchoredFlat} outside={outside} /> : null}
        <div class="review-rail-batch">
          <BatchBar prNumber={num} repoRoot={repo} />
        </div>
      </aside>

      <ReviewSessionDrawer prNumber={num} repoRoot={repo} />
    </div>
  );
}
