import { useEffect, useMemo } from "preact/hooks";
import { parseUnifiedDiff } from "../../lib/diff";
import { enterPrMode } from "../../lib/modes";
import {
  REVIEW_STRIP_WIDTH,
  reviewNavCollapsed,
  reviewNavWidth,
  reviewRailCollapsed,
  reviewRailWidth,
} from "../../signals/layout";
import {
  clearPerPrHeaderState,
  clearSelectedReviewRun,
  clearSelection,
  displayedFindings,
  loadPrDigest,
  loadReviewBundle,
  loadReviewRuns,
  reviewBundle,
  reviewError,
  reviewLoading,
} from "../../signals/review";
import { currentReviewPrNumber, currentReviewRepo } from "../../signals/ui";
import type { ForgeFindingSeverity } from "../../types";
import { BatchBar } from "./BatchBar";
import { anchorFindings, anchorThreads, DiffPane, groupIntoThreads } from "./DiffPane";
import { FindingsRail } from "./FindingsRail";
import { IntentPanel } from "./IntentPanel";
import { LeftNav } from "./LeftNav";
import { PaneSplitter } from "./PaneSplitter";
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
      // selection so the new PR opens on its bundle defaults, and clear the
      // triage selection so checkboxes don't leak across PRs.
      clearSelectedReviewRun();
      clearSelection();
      clearPerPrHeaderState();
      void loadReviewBundle(num, repo);
      void loadReviewRuns(num, repo);
      // Cheap DB/disk read — no gh calls — so the digest (if one exists)
      // renders with the bundle instead of on first Description-tab click.
      void loadPrDigest(num, repo);
    }
  }, [num, repo]);

  const parsedDiff = useMemo(() => (bundle ? parseUnifiedDiff(bundle.diff) : []), [bundle]);
  const { anchoredFlat, outside } = useMemo(() => {
    if (!bundle) return { anchored: new Map(), anchoredFlat: [], outside: [] };
    return anchorFindings(findings, parsedDiff);
  }, [bundle, findings, parsedDiff]);

  // Anchor inline comment threads the same way the diff does, so the rail can
  // list them (anchored → jump-to-diff; stale → not fixable) alongside findings.
  const commentAnchoring = useMemo(() => {
    if (!bundle) return { anchoredFlat: [] as ReturnType<typeof anchorThreads>["anchoredFlat"], stale: [] };
    const threads = groupIntoThreads(bundle.inlineComments);
    const { anchoredFlat: ca, stale } = anchorThreads(threads, parsedDiff);
    return { anchoredFlat: ca, stale };
  }, [bundle, parsedDiff]);

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

  const navCollapsed = reviewNavCollapsed.value;
  const railCollapsed = reviewRailCollapsed.value;
  const navW = navCollapsed ? REVIEW_STRIP_WIDTH : reviewNavWidth.value;
  const railW = railCollapsed ? REVIEW_STRIP_WIDTH : reviewRailWidth.value;
  const gridStyle = `--review-nav-w:${navW}px;--review-rail-w:${railW}px`;

  return (
    <div
      class={`review-page review-three-pane${navCollapsed ? " nav-collapsed" : ""}${railCollapsed ? " rail-collapsed" : ""}`}
      style={gridStyle}
    >
      {navCollapsed ? (
        <CollapsedPaneStrip
          side="nav"
          label="Files"
          onExpand={() => {
            reviewNavCollapsed.value = false;
          }}
        />
      ) : bundle ? (
        <LeftNav files={parsedDiff} findingsByFile={findingsByFile} />
      ) : (
        <aside class="review-nav empty" />
      )}

      {navCollapsed ? <div class="review-splitter inert for-nav" aria-hidden="true" /> : <PaneSplitter side="nav" />}

      <main class="review-center">
        <ReviewActionBar prNumber={num} repoRoot={repo} loading={loading} />
        {loading && !bundle ? <div class="review-status">Loading PR review bundle…</div> : null}
        {err ? <div class="review-status error">{err}</div> : null}
        {bundle ? (
          <>
            <ReviewHeader bundle={bundle} repoRoot={repo} />
            <DiffPane bundle={bundle} findings={findings} />
            <UnanchoredComments bundle={bundle} />
          </>
        ) : null}
      </main>

      {railCollapsed ? <div class="review-splitter inert for-rail" aria-hidden="true" /> : <PaneSplitter side="rail" />}

      {railCollapsed ? (
        <CollapsedPaneStrip
          side="rail"
          label="Findings"
          onExpand={() => {
            reviewRailCollapsed.value = false;
          }}
        />
      ) : (
        <aside class="review-rail">
          <div class="review-rail-tools">
            <button
              type="button"
              class="pane-collapse-btn"
              title="Collapse findings panel"
              aria-label="Collapse findings panel"
              onClick={() => {
                reviewRailCollapsed.value = true;
              }}
            >
              »
            </button>
          </div>
          <ReviewHistoryPicker prNumber={num} repoRoot={repo} />
          {bundle?.linkedPlanId ? <IntentPanel planId={bundle.linkedPlanId} /> : null}
          {bundle ? (
            <FindingsRail
              anchoredFindings={anchoredFlat}
              outsideFindings={outside}
              anchoredComments={commentAnchoring.anchoredFlat}
              staleComments={commentAnchoring.stale}
              reviews={bundle.prReviews}
            />
          ) : null}
          <div class="review-rail-batch">
            <BatchBar prNumber={num} repoRoot={repo} />
          </div>
        </aside>
      )}

      <ReviewSessionDrawer prNumber={num} repoRoot={repo} />
    </div>
  );
}

/**
 * Thin vertical rail shown in place of a collapsed pane: a single button that
 * expands it again, with the panel name rotated alongside an arrow so the
 * affordance reads at 40px wide.
 */
function CollapsedPaneStrip({ side, label, onExpand }: { side: "nav" | "rail"; label: string; onExpand: () => void }) {
  return (
    <aside class={`review-pane-strip ${side === "nav" ? "review-nav" : "review-rail"} collapsed`}>
      <button
        type="button"
        class="pane-expand-btn"
        title={`Show ${label}`}
        aria-label={`Show ${label} panel`}
        onClick={onExpand}
      >
        <span class="pane-expand-ic">{side === "nav" ? "»" : "«"}</span>
        <span class="pane-strip-label">{label}</span>
      </button>
    </aside>
  );
}
