// Worktree inventory signals — backs the "Worktrees" sidebar view.
//
// The refreshWorktrees() call hits GET /api/worktrees and replaces the
// signal. Remove / clean-merged / test-locally actions trigger a refresh
// after the mutation completes so the UI reflects the new state.
import { signal } from "@preact/signals";
import { type ApiError, apiGet, apiPost } from "../lib/api";
import { showToast } from "../lib/toast";
import type { WorktreeEntry, WorktreesResponse } from "../types";
import { selectedRepo } from "./ui";

export const worktrees = signal<WorktreeEntry[]>([]);
export const worktreesRepoName = signal<string | null>(null);
export const worktreesRepoRoot = signal<string | null>(null);
export const worktreesLoading = signal<boolean>(false);
export const worktreesError = signal<string | null>(null);

function repoQuery(): string {
  return selectedRepo.value ? `?repo=${encodeURIComponent(selectedRepo.value)}` : "";
}

export async function refreshWorktrees(): Promise<void> {
  worktreesLoading.value = true;
  try {
    const data = await apiGet<WorktreesResponse>(`/api/worktrees${repoQuery()}`);
    worktrees.value = data.worktrees || [];
    worktreesRepoName.value = data.repo || null;
    worktreesRepoRoot.value = data.repoRoot || null;
    worktreesError.value = null;
  } catch (e) {
    const err = e as ApiError;
    worktrees.value = [];
    worktreesError.value = err.hint ? `${err.message} — ${err.hint}` : err.message || "Could not load worktrees.";
  } finally {
    worktreesLoading.value = false;
  }
}

export async function removeWorktree(targetPath: string, force = false): Promise<void> {
  const repo = worktreesRepoRoot.value || selectedRepo.value;
  if (!repo) {
    showToast("No repo selected.", "error");
    return;
  }
  try {
    await apiPost("/api/worktrees/remove", { repo, path: targetPath, force });
    showToast(`Removed ${targetPath}`, "info");
    await refreshWorktrees();
  } catch (e) {
    const err = e as ApiError;
    showToast(err.hint ? `${err.message} — ${err.hint}` : err.message, "error");
  }
}

export async function cleanMergedWorktrees(
  dryRun = false,
): Promise<{ removed: WorktreeEntry[]; skipped: number } | null> {
  const repo = worktreesRepoRoot.value || selectedRepo.value;
  if (!repo) {
    showToast("No repo selected.", "error");
    return null;
  }
  try {
    const data = await apiPost<{ removed: WorktreeEntry[]; skipped: Array<{ entry: WorktreeEntry; reason: string }> }>(
      "/api/worktrees/clean-merged",
      { repo, dryRun },
    );
    const removed = data.removed || [];
    const skipped = data.skipped || [];
    if (dryRun) {
      showToast(`Dry-run: would remove ${removed.length}, keep ${skipped.length}.`, "info");
    } else {
      showToast(`Removed ${removed.length}, kept ${skipped.length}.`, "info");
      await refreshWorktrees();
    }
    return { removed, skipped: skipped.length };
  } catch (e) {
    const err = e as ApiError;
    showToast(err.hint ? `${err.message} — ${err.hint}` : err.message, "error");
    return null;
  }
}

export async function testWorktreeLocally(targetPath: string): Promise<void> {
  const repo = worktreesRepoRoot.value || selectedRepo.value;
  if (!repo) {
    showToast("No repo selected.", "error");
    return;
  }
  try {
    const data = await apiPost<{ parked: WorktreeEntry; priorRef: string }>("/api/worktrees/test-locally", {
      repo,
      path: targetPath,
    });
    showToast(`Parked ${targetPath}; main now on ${data.parked.branch} (was ${data.priorRef}).`, "info");
    await refreshWorktrees();
  } catch (e) {
    const err = e as ApiError;
    showToast(err.hint ? `${err.message} — ${err.hint}` : err.message, "error");
  }
}

export async function restoreWorktree(): Promise<void> {
  const repo = worktreesRepoRoot.value || selectedRepo.value;
  if (!repo) {
    showToast("No repo selected.", "error");
    return;
  }
  try {
    const data = await apiPost<{ restoredTo: string | null; noop?: true }>("/api/worktrees/restore", { repo });
    if (data.noop) {
      showToast("No test-locally state to restore.", "info");
    } else {
      showToast(`Main restored to ${data.restoredTo}.`, "info");
    }
    await refreshWorktrees();
  } catch (e) {
    const err = e as ApiError;
    showToast(err.hint ? `${err.message} — ${err.hint}` : err.message, "error");
  }
}
