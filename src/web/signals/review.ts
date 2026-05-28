// Signals backing the PR review page. Phase 1 only exposes data we read
// from `GET /api/prs/:num/review-bundle` plus the selection/status state
// the Phase 2 fix UI will mutate; nothing here triggers any POST yet.
import { signal } from "@preact/signals";
import { type ApiError, apiGet } from "../lib/api";
import type { PrReviewBundle } from "../types";

export const reviewBundle = signal<PrReviewBundle | null>(null);
export const reviewLoading = signal<boolean>(false);
export const reviewError = signal<string | null>(null);

export type CommentStatus = "pending" | "disputed" | "fixing" | "fixed";

// Selection state for the per-comment checkboxes; Phase 2 fixers will
// consume these to drive the BatchBar "Fix N selected" action. The Set
// uses comment id (number) coerced to string so the same signal can host
// future ad-hoc identifiers (e.g. unanchored heuristics) without retype.
export const selectedComments = signal<Set<string>>(new Set());
export const commentStatuses = signal<Map<string, CommentStatus>>(new Map());

export function toggleCommentSelection(commentId: string | number): void {
  const next = new Set(selectedComments.value);
  const key = String(commentId);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  selectedComments.value = next;
}

export function clearReviewState(): void {
  reviewBundle.value = null;
  reviewError.value = null;
  selectedComments.value = new Set();
  commentStatuses.value = new Map();
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
