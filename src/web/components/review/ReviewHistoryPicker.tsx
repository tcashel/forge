import {
  clearSelectedReviewRun,
  loadReviewRun,
  reviewRuns,
  reviewRunsError,
  reviewRunsLoading,
  selectedReviewRun,
  selectedReviewRunId,
  selectedReviewRunLoading,
} from "../../signals/review";
import type { ReviewRunStatus, ReviewRunSummary, ReviewSeverityCounts, ReviewVerdict } from "../../types";
import { timeAgo } from "../prs/pr-format";

interface Props {
  prNumber: number;
  repoRoot: string;
}

function statusLabel(status: ReviewRunStatus): string {
  if (status === "running") return "in progress";
  return status;
}

function verdictLabel(v: ReviewVerdict | null): string {
  if (v === "approve") return "approve";
  if (v === "request-changes") return "request changes";
  if (v === "block") return "block";
  return "—";
}

function verdictClass(v: ReviewVerdict | null): string {
  if (v === "approve") return "pass";
  if (v === "request-changes") return "pend";
  if (v === "block") return "fail";
  return "none";
}

function countsSummary(counts: ReviewSeverityCounts, total: number): string {
  if (total === 0) return "no findings";
  const parts: string[] = [];
  if (counts.BLOCKER) parts.push(`${counts.BLOCKER} BLOCKER`);
  if (counts.HIGH) parts.push(`${counts.HIGH} HIGH`);
  if (counts.MEDIUM) parts.push(`${counts.MEDIUM} MEDIUM`);
  if (counts.LOW) parts.push(`${counts.LOW} LOW`);
  return parts.join(", ") || `${total} finding${total === 1 ? "" : "s"}`;
}

function newestCompleted(runs: ReviewRunSummary[]): ReviewRunSummary | null {
  for (const r of runs) {
    if (r.status === "completed") return r;
  }
  return null;
}

export function ReviewHistoryPicker({ prNumber, repoRoot }: Props) {
  const runs = reviewRuns.value;
  if (runs.length === 0) return null;

  const loading = reviewRunsLoading.value;
  const err = reviewRunsError.value;
  const selectedId = selectedReviewRunId.value;
  const selectedDetail = selectedReviewRun.value;
  const detailLoading = selectedReviewRunLoading.value;
  const latest = newestCompleted(runs);

  const onSelect = (run: ReviewRunSummary) => {
    if (run.status === "running") return;
    // Clicking the "latest" row when its findings already drive the page
    // (i.e. nothing selected) is a no-op.
    if (selectedId === null && latest?.sessionId === run.sessionId) return;
    if (selectedId === run.sessionId && selectedDetail?.sessionId === run.sessionId) return;
    void loadReviewRun(prNumber, repoRoot, run.sessionId);
  };

  const onShowLatest = () => {
    clearSelectedReviewRun();
  };

  return (
    <section class="review-history">
      <header class="review-history-header">
        <h2>Past Forge reviews</h2>
        <div class="review-history-actions">
          {selectedId !== null ? (
            <button type="button" class="btn btn-ghost" onClick={onShowLatest}>
              Show latest findings
            </button>
          ) : null}
          {loading ? <span class="review-history-status">Refreshing…</span> : null}
        </div>
      </header>
      {err ? <div class="review-status error">{err}</div> : null}
      <ul class="review-history-list">
        {runs.map((run) => {
          const isLatestHighlight = selectedId === null && latest?.sessionId === run.sessionId;
          const isSelected = selectedId === run.sessionId;
          const isRunning = run.status === "running";
          const classes = ["review-history-row"];
          if (isSelected) classes.push("selected");
          if (isLatestHighlight) classes.push("latest");
          if (isRunning) classes.push("running");
          const label = isRunning ? "Forge review in progress…" : countsSummary(run.findingCounts, run.findingsTotal);
          return (
            <li key={run.sessionId}>
              <button
                type="button"
                class={classes.join(" ")}
                disabled={isRunning}
                onClick={() => onSelect(run)}
                title={
                  isRunning
                    ? "This review is still running."
                    : isLatestHighlight
                      ? "Latest Forge review — currently displayed."
                      : "Load this review's findings."
                }
              >
                <span class="review-history-when">{timeAgo(run.startedAt)} ago</span>
                <span class={`review-history-status status-${run.status}`}>{statusLabel(run.status)}</span>
                {!isRunning ? (
                  <span class={`review-history-verdict pr-status ${verdictClass(run.verdict)}`}>
                    {verdictLabel(run.verdict)}
                  </span>
                ) : null}
                <span class="review-history-counts">{label}</span>
                {isLatestHighlight ? <span class="review-history-badge">latest</span> : null}
                {isSelected && detailLoading ? <span class="review-history-status">Loading…</span> : null}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
