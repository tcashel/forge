// Signals backing the PR review page. Phase 1 only exposes data we read
// from `GET /api/prs/:num/review-bundle` plus the selection/status state
// the Phase 2 fix UI will mutate; nothing here triggers any POST yet.
import { computed, effect, signal } from "@preact/signals";
import { type ApiError, apiGet, apiPost } from "../lib/api";
import { readPublishPref, writePublishPref } from "../lib/publish-pref";
import type { FixTarget } from "../lib/review-targets";
import type {
  DroppedFixTarget,
  ForgeFinding,
  PrCommit,
  PrDigest,
  PrReviewBundle,
  PublishRecord,
  ReviewRunDetail,
  ReviewRunSummary,
} from "../types";
import { currentReviewPrNumber } from "./ui";

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
// running (or finished but still on screen) for the active PR. The
// ReviewSessionDrawer subscribes to it and stamps `done: true` when the
// worker's log stream fires `done`; only an explicit drawer close (or a PR
// switch via clearReviewState) clears the signal, so failure text stays
// visible instead of unmounting with the drawer.
export interface ActiveWorkerSession {
  sessionId: string;
  prNum: number;
  /** Set by the drawer when the worker finished; the session stays on
   *  screen but no longer counts as "running" for the action bar. */
  done?: boolean;
}

export const activeReviewSession = signal<ActiveWorkerSession | null>(null);

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
export const activeCommentFixSession = signal<ActiveWorkerSession | null>(null);

// ─── center-header tabs (Description | Discussion | Commits) ────────────────

export type ReviewTab = "description" | "discussion" | "commits";

// null = "auto": Description when the PR has a body, else Discussion. The
// ReviewTabs component resolves it so the default tracks the loaded bundle.
export const reviewActiveTab = signal<ReviewTab | null>(null);

// Commits are lazy — fetched on first Commits-tab activation, not with the
// bundle, so PRs whose tab is never opened pay nothing.
export const reviewCommits = signal<PrCommit[] | null>(null);
export const reviewCommitsLoading = signal<boolean>(false);
export const reviewCommitsError = signal<string | null>(null);

// ─── PR digest ("what does this PR do") ──────────────────────────────────────

export const prDigest = signal<PrDigest | null>(null);
export const prDigestLoading = signal<boolean>(false);
// Non-null while a digest worker runs for the active PR (same lifecycle as
// activeReviewSession, but the DigestCard renders its own one-line status —
// no drawer).
export const activeDigestSession = signal<ActiveWorkerSession | null>(null);
export const digestError = signal<string | null>(null);

export async function loadPrDigest(prNumber: number, repoRoot: string): Promise<void> {
  prDigestLoading.value = true;
  try {
    const q = `?repo=${encodeURIComponent(repoRoot)}`;
    const data = await apiGet<{ digest: PrDigest | null }>(`/api/prs/${prNumber}/digest${q}`);
    // Guard against a PR switch racing the response — a slow reply for PR A
    // must not overwrite PR B's (cleared) digest view.
    if (currentReviewPrNumber.value !== prNumber) return;
    prDigest.value = data.digest;
  } catch {
    // Missing digest is the common case and not an error worth surfacing.
    if (currentReviewPrNumber.value === prNumber) prDigest.value = null;
  } finally {
    prDigestLoading.value = false;
  }
}

export async function startPrDigest(prNumber: number, repoRoot: string): Promise<void> {
  digestError.value = null;
  try {
    const res = await apiPost<{ sessionId: string }>(`/api/prs/${prNumber}/digest`, { repo: repoRoot });
    activeDigestSession.value = { sessionId: res.sessionId, prNum: prNumber };
  } catch (e) {
    const err = e as ApiError;
    digestError.value = err.hint ? `${err.message} — ${err.hint}` : err.message || "Could not start digest.";
  }
}

// ─── PR lifecycle actions (ready-for-review / approve) ──────────────────────

// Which lifecycle action is in flight ("ready" | "approve" | null). One at a
// time: the whole PrControls cluster disables while a call runs.
export const prActionPending = signal<string | null>(null);

async function runPrAction(action: "ready" | "approve", prNumber: number, repoRoot: string): Promise<void> {
  prActionPending.value = action;
  try {
    await apiPost<{ ok: boolean }>(`/api/prs/${prNumber}/${action}`, { repo: repoRoot });
    // Reflect the new PR state (draft flag / review decision) immediately.
    void loadReviewBundle(prNumber, repoRoot);
  } finally {
    prActionPending.value = null;
  }
}

export function markPrReady(prNumber: number, repoRoot: string): Promise<void> {
  return runPrAction("ready", prNumber, repoRoot);
}

export function approvePr(prNumber: number, repoRoot: string): Promise<void> {
  return runPrAction("approve", prNumber, repoRoot);
}

export async function loadReviewCommits(prNumber: number, repoRoot: string): Promise<void> {
  reviewCommitsLoading.value = true;
  reviewCommitsError.value = null;
  try {
    const q = `?repo=${encodeURIComponent(repoRoot)}`;
    const data = await apiGet<{ commits: PrCommit[] }>(`/api/prs/${prNumber}/commits${q}`);
    // Same PR-switch race guard as loadPrDigest.
    if (currentReviewPrNumber.value !== prNumber) return;
    reviewCommits.value = data.commits ?? [];
  } catch (e) {
    if (currentReviewPrNumber.value !== prNumber) return;
    const err = e as ApiError;
    reviewCommits.value = null;
    reviewCommitsError.value = err.hint ? `${err.message} — ${err.hint}` : err.message || "Could not load commits.";
  } finally {
    reviewCommitsLoading.value = false;
  }
}

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

// Reset only the per-PR triage selection + live status tracking. Called when
// the active PR changes so a new PR opens with nothing selected, without
// flashing the whole page to a null bundle the way clearReviewState() does.
export function clearSelection(): void {
  selectedTargets.value = new Set();
  commentStatuses.value = new Map();
}

// Reset the per-PR center-header state (active tab, commits list, digest
// view) on PR switch — without this, PR A's commits/digest linger when the
// operator jumps straight to PR B. activeDigestSession deliberately
// survives: the DigestCard gates on its prNum, so a digest still running
// for PR A resumes its live status when the operator returns to A.
export function clearPerPrHeaderState(): void {
  reviewActiveTab.value = null;
  reviewCommits.value = null;
  reviewCommitsError.value = null;
  prDigest.value = null;
  digestError.value = null;
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
  reviewActiveTab.value = null;
  reviewCommits.value = null;
  reviewCommitsError.value = null;
  prDigest.value = null;
  activeDigestSession.value = null;
  digestError.value = null;
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

// Per-request toggle for publishing findings to the PR as GitHub review
// comments. The default sticks across sessions (localStorage, theme.ts
// pattern) so the operator sets it once; the checkbox stays a per-run
// override.
export const publishToGitHub = signal<boolean>(readPublishPref());

effect(() => {
  writePublishPref(publishToGitHub.value);
});

export async function startAdHocReview(
  prNumber: number,
  repoRoot: string,
  opts?: { publishToGitHub?: boolean },
): Promise<RunReviewResponse> {
  return apiPost<RunReviewResponse>(`/api/prs/${prNumber}/run-review`, {
    repo: repoRoot,
    publishToGitHub: opts?.publishToGitHub === true,
  });
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

/**
 * Retry a failed/partial publish for a recorded review run. POSTs to the
 * republish route (`/api/prs/:num/reviews/:sessionId/publish`); the caller
 * handles a 404 gracefully (older servers don't expose it yet) and
 * refreshes the run list on success.
 */
export async function retryPublish(prNumber: number, repoRoot: string, sessionId: string): Promise<PublishRecord> {
  return apiPost<PublishRecord>(`/api/prs/${prNumber}/reviews/${encodeURIComponent(sessionId)}/publish`, {
    repo: repoRoot,
  });
}

export interface RunCommentFixResponse {
  sessionId: string;
  logStreamUrl: string;
  /**
   * Targets the server filtered out before the worker spawned (stale
   * finding id, unanchored comment, missing review). Optional: older
   * servers omit it. The UI must surface these — a partial selection
   * never silently shrinks.
   */
  droppedTargets?: DroppedFixTarget[];
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
