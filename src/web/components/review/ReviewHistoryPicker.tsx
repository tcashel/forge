import { useState } from "preact/hooks";
import type { ApiError } from "../../lib/api";
import { publishChip } from "../../lib/publish-chip";
import { showToast } from "../../lib/toast";
import {
  clearSelectedReviewRun,
  loadReviewRun,
  loadReviewRuns,
  retryPublish,
  reviewRuns,
  reviewRunsError,
  reviewRunsLoading,
  selectedReviewRun,
  selectedReviewRunId,
  selectedReviewRunLoading,
} from "../../signals/review";
import type {
  FindingPublishOutcome,
  PublishRecord,
  ReviewRunDetail,
  ReviewRunStatus,
  ReviewRunSummary,
  ReviewSeverityCounts,
  ReviewVerdict,
} from "../../types";
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

function PublishChipSpan({ publish, placeholder = false }: { publish: PublishRecord | null; placeholder?: boolean }) {
  const chip = publishChip(publish);
  if (!chip) {
    // Pre-publish-record runs have no publish.json; the row still renders
    // a neutral placeholder so the history grid columns stay aligned.
    if (!placeholder) return null;
    return (
      <span class="review-publish-chip pr-status none" title="No publish record for this run.">
        —
      </span>
    );
  }
  return (
    <span class={`review-publish-chip pr-status ${chip.className}`} title={chip.detail ?? undefined}>
      {chip.label}
    </span>
  );
}

function outcomeLabel(o: FindingPublishOutcome): string {
  if (o.status === "posted") return "posted";
  if (o.status === "already-published") return "already published";
  if (o.status === "out-of-diff-posted") return "posted (outside diff)";
  return "failed";
}

/** Per-finding publish outcomes for the selected run's publish record. */
function PublishDetail({ detail }: { detail: ReviewRunDetail }) {
  const publish = detail.publish;
  const chip = publishChip(publish);
  if (!publish || !chip) return null;
  return (
    <div class="review-history-publish-detail">
      <header class="review-history-publish-header">
        <h3>Publish to PR</h3>
        <PublishChipSpan publish={publish} />
      </header>
      {chip.detail ? <div class="review-status error">{chip.detail}</div> : null}
      {publish.findings.length > 0 ? (
        <ul class="review-history-publish-findings">
          {publish.findings.map((o) => (
            <li key={o.id} class={`publish-finding-outcome outcome-${o.status}`}>
              <span class="publish-finding-id">{o.id}</span>
              <span class={`pr-status ${o.status === "failed" ? "fail" : "pass"}`}>{outcomeLabel(o)}</span>
              {o.error ? <span class="publish-finding-error"> — {o.error}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function ReviewHistoryPicker({ prNumber, repoRoot }: Props) {
  const runs = reviewRuns.value;
  const [retryingId, setRetryingId] = useState<string | null>(null);
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

  const onRetryPublish = async (run: ReviewRunSummary) => {
    if (retryingId !== null) return;
    setRetryingId(run.sessionId);
    try {
      const record = await retryPublish(prNumber, repoRoot, run.sessionId);
      const chip = publishChip(record);
      showToast(`Publish retried: ${chip?.label ?? record.state}`, record.state === "failed" ? "error" : "info");
      await loadReviewRuns(prNumber, repoRoot);
      // The selected detail carries its own publish record — refresh it too.
      if (selectedId === run.sessionId) void loadReviewRun(prNumber, repoRoot, run.sessionId);
    } catch (e) {
      const apiErr = e as ApiError;
      // Older servers don't expose the republish route yet — say so
      // instead of surfacing a bare 404.
      if (apiErr.code === "HTTP_404" || apiErr.code === "NOT_FOUND") {
        showToast(
          "Retry publish is not available on this server — run `forge review --publish-only` instead.",
          "error",
        );
      } else {
        showToast(
          apiErr.hint ? `${apiErr.message} — ${apiErr.hint}` : apiErr.message || "Retry publish failed.",
          "error",
        );
      }
    } finally {
      setRetryingId(null);
    }
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
          const chip = publishChip(run.publish);
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
                {!isRunning ? <PublishChipSpan publish={run.publish} placeholder /> : null}
                <span class="review-history-counts">{label}</span>
                {isLatestHighlight ? <span class="review-history-badge">latest</span> : null}
                {isSelected && detailLoading ? <span class="review-history-status">Loading…</span> : null}
              </button>
              {chip?.retryable ? (
                <div class="review-history-row-actions">
                  {chip.detail ? <span class="review-history-publish-error">{chip.detail}</span> : null}
                  <button
                    type="button"
                    class="btn btn-secondary btn-retry-publish"
                    disabled={retryingId !== null}
                    onClick={() => void onRetryPublish(run)}
                    title="Re-run the idempotent publish for this review's findings."
                  >
                    {retryingId === run.sessionId ? "Retrying…" : "Retry publish"}
                  </button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      {selectedDetail && selectedId === selectedDetail.sessionId ? <PublishDetail detail={selectedDetail} /> : null}
    </section>
  );
}
