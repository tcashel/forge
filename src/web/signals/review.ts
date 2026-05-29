// Signals backing the PR review page. Phase 1 only exposes data we read
// from `GET /api/prs/:num/review-bundle` plus the selection/status state
// the Phase 2 fix UI will mutate; nothing here triggers any POST yet.
import { computed, signal } from "@preact/signals";
import { type ApiError, apiGet, apiPost } from "../lib/api";
import type { FixTarget } from "../lib/review-targets";
import type { ForgeFinding, PrReviewBundle, ReviewRunDetail, ReviewRunSummary } from "../types";

export const reviewBundle = signal<PrReviewBundle | null>(null);
export const reviewLoading = signal<boolean>(false);
export const reviewError = signal<string | null>(null);

export type CommentStatus = "pending" | "disputed" | "fixing" | "fixed";

// Selection state for the unified triage checkboxes; the BatchBar "Fix N
// selected" action consumes these. The Set holds `source:id` fix-target
// tokens (see lib/review-targets) so a single signal hosts Forge findings,
// inline comments, and review summaries uniformly.
export const selectedTargets = signal<Set<string>>(new Set());
export const commentStatuses = signal<Map<string, CommentStatus>>(new Map());

// Ad-hoc reviewer session signal — non-null while an ad-hoc review is
// running for the active PR. The ReviewSessionDrawer subscribes to it.
export const activeReviewSession = signal<{ sessionId: string; prNum: number } | null>(null);

// Review history (past Forge reviews recorded for the active PR).
export const reviewRuns = signal<ReviewRunSummary[]>([]);
export const reviewRunsLoading = signal<boolean>(false);
export const reviewRunsError = signal<string | null>(null);

// When non-null, the page renders this run's findings instead of the
// `reviewBundle.forgeFindings` projection. Clearing returns the display
// to the bundle's "latest findings" semantics.
export const selectedReviewRunId = signal<string | null>(null);
export const selectedReviewRun = signal<ReviewRunDetail | null>(null);
export const selectedReviewRunLoading = signal<boolean>(false);
export const selectedReviewRunError = signal<string | null>(null);

// Findings driving the DiffPane / OutsideDiffFindings: explicit run
// selection wins; otherwise we fall through to the bundle's findings —
// preserving today's `findLatestForgeFindings` behaviour.
export const displayedFindings = computed<ForgeFinding[]>(() => {
  const run = selectedReviewRun.value;
  if (run && selectedReviewRunId.value === run.sessionId) return run.findings;
  return reviewBundle.value?.forgeFindings ?? [];
});
// Active comment-fix session — analogous to activeReviewSession but for
// the validate-then-fix worker spawned by `Fix N selected`.
export const activeCommentFixSession = signal<{ sessionId: string; prNum: number } | null>(null);

export function toggleTargetSelection(token: string): void {
  const next = new Set(selectedTargets.value);
  if (next.has(token)) next.delete(token);
  else next.add(token);
  selectedTargets.value = next;
}

export function setTargetStatuses(tokens: string[], status: CommentStatus): void {
  const next = new Map(commentStatuses.value);
  for (const token of tokens) next.set(token, status);
  commentStatuses.value = next;
}

export function clearReviewState(): void {
  reviewBundle.value = null;
  reviewError.value = null;
  selectedTargets.value = new Set();
  commentStatuses.value = new Map();
  activeReviewSession.value = null;
  reviewRuns.value = [];
  reviewRunsError.value = null;
  selectedReviewRunId.value = null;
  selectedReviewRun.value = null;
  selectedReviewRunError.value = null;
  activeCommentFixSession.value = null;
}

export async function loadReviewBundle(prNumber: number, repoRoot: string): Promise<void> {
  reviewLoading.value = true;
  reviewError.value = null;
  try {
    const q = `?repo=${encodeURIComponent(repoRoot)}`;
    const data = await apiGet<PrReviewBundle>(`/api/prs/${prNumber}/review-bundle${q}`);
    reviewBundle.value = data;
  } catch (e) {
    const err = e as ApiError;
    reviewBundle.value = null;
    reviewError.value = err.hint ? `${err.message} — ${err.hint}` : err.message || "Could not load review bundle.";
  } finally {
    reviewLoading.value = false;
  }
}

export interface RunReviewResponse {
  sessionId: string;
  logStreamUrl: string;
}

export async function startAdHocReview(prNumber: number, repoRoot: string): Promise<RunReviewResponse> {
  return apiPost<RunReviewResponse>(`/api/prs/${prNumber}/run-review`, { repo: repoRoot });
}

interface ReviewsListResponse {
  reviews: ReviewRunSummary[];
}

export async function loadReviewRuns(prNumber: number, repoRoot: string): Promise<void> {
  reviewRunsLoading.value = true;
  reviewRunsError.value = null;
  try {
    const q = `?repo=${encodeURIComponent(repoRoot)}`;
    const data = await apiGet<ReviewsListResponse>(`/api/prs/${prNumber}/reviews${q}`);
    reviewRuns.value = data.reviews ?? [];
  } catch (e) {
    const err = e as ApiError;
    reviewRuns.value = [];
    reviewRunsError.value = err.hint ? `${err.message} — ${err.hint}` : err.message || "Could not load review history.";
  } finally {
    reviewRunsLoading.value = false;
  }
}

export async function loadReviewRun(prNumber: number, repoRoot: string, sessionId: string): Promise<void> {
  selectedReviewRunLoading.value = true;
  selectedReviewRunError.value = null;
  // Optimistically advance the selection so the UI can hide the older
  // run's findings while the load is in flight. selectedReviewRun is
  // gated on id-match so stale data won't render.
  selectedReviewRunId.value = sessionId;
  try {
    const q = `?repo=${encodeURIComponent(repoRoot)}`;
    const data = await apiGet<ReviewRunDetail>(`/api/prs/${prNumber}/reviews/${encodeURIComponent(sessionId)}${q}`);
    if (selectedReviewRunId.value !== sessionId) return; // user moved on
    selectedReviewRun.value = data;
  } catch (e) {
    const err = e as ApiError;
    if (selectedReviewRunId.value === sessionId) {
      selectedReviewRun.value = null;
      selectedReviewRunError.value = err.hint
        ? `${err.message} — ${err.hint}`
        : err.message || "Could not load review.";
    }
  } finally {
    selectedReviewRunLoading.value = false;
  }
}

export function clearSelectedReviewRun(): void {
  selectedReviewRunId.value = null;
  selectedReviewRun.value = null;
  selectedReviewRunError.value = null;
}

export interface RunCommentFixResponse {
  sessionId: string;
  logStreamUrl: string;
}

export async function startCommentFix(
  prNumber: number,
  repoRoot: string,
  targets: FixTarget[],
): Promise<RunCommentFixResponse> {
  return apiPost<RunCommentFixResponse>(`/api/prs/${prNumber}/fix-comments`, {
    repo: repoRoot,
    targets,
  });
}
