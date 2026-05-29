// Worktrees view — single-pane list (no detail panel). Rows show the
// safety badge, branch/PR linkage, and per-row Remove / Test locally
// actions. A "Clean merged" bulk button is at the top.
import {
  cleanMergedWorktrees,
  refreshWorktrees,
  removeWorktree,
  restoreWorktree,
  testWorktreeLocally,
  worktrees,
  worktreesError,
  worktreesLoading,
  worktreesRepoName,
} from "../../signals/worktrees";
import type { WorktreeEntry, WorktreeSafety } from "../../types";

function badgeClass(safety: WorktreeSafety): string {
  return `wt-badge wt-badge-${safety}`;
}

function badgeLabel(safety: WorktreeSafety): string {
  switch (safety) {
    case "safe":
      return "safe";
    case "removable":
      return "removable";
    case "in-use":
      return "in use";
    case "unsafe":
      return "unsafe";
    case "unmanaged":
      return "unmanaged";
    default:
      return "unknown";
  }
}

interface RowProps {
  entry: WorktreeEntry;
}

function WorktreeRow({ entry }: RowProps) {
  const onRemove = () => {
    void removeWorktree(entry.path, false);
  };
  const onForceRemove = () => {
    if (!confirm(`Force-remove ${entry.path}? Local changes / unpushed commits will be lost.`)) return;
    void removeWorktree(entry.path, true);
  };
  const onTest = () => {
    void testWorktreeLocally(entry.path);
  };
  const removeDisabled = entry.safety === "in-use" || entry.safety === "unmanaged";
  const showForce = entry.safety === "unsafe" || entry.safety === "unknown";
  return (
    <div class="wt-row">
      <div class="wt-row-head">
        <span class={badgeClass(entry.safety)}>{badgeLabel(entry.safety)}</span>
        <span class="wt-path" title={entry.path}>
          {entry.path}
        </span>
      </div>
      <div class="wt-row-meta">
        <span>
          <b>Branch</b> {entry.branch ?? "(detached)"}
        </span>
        <span>
          <b>PR</b>{" "}
          {entry.prNumber != null ? (
            <>
              #{entry.prNumber} <em>{entry.prState}</em>
            </>
          ) : (
            "(no PR)"
          )}
        </span>
        {entry.inFlight ? <span class="wt-flag">session running</span> : null}
        {entry.dirty ? <span class="wt-flag">dirty</span> : null}
        {entry.unpushed && !entry.dirty ? <span class="wt-flag">unpushed</span> : null}
      </div>
      <div class="wt-row-reason">{entry.reason}</div>
      <div class="wt-row-actions">
        {showForce ? (
          <button type="button" class="btn sm btn-danger" disabled={removeDisabled} onClick={onForceRemove}>
            Force remove
          </button>
        ) : (
          <button type="button" class="btn sm btn-secondary" disabled={removeDisabled} onClick={onRemove}>
            Remove
          </button>
        )}
        <button
          type="button"
          class="btn sm btn-ghost"
          disabled={entry.safety === "in-use" || entry.safety === "unsafe" || !entry.branch}
          onClick={onTest}
        >
          Test locally
        </button>
      </div>
    </div>
  );
}

export function WorktreeList() {
  const list = worktrees.value;
  const loading = worktreesLoading.value;
  const err = worktreesError.value;
  const repoLabel = worktreesRepoName.value || "selected repo";
  const safeCount = list.filter((w) => w.safety === "safe").length;

  const onRefresh = () => {
    void refreshWorktrees();
  };
  const onCleanMerged = () => {
    if (safeCount === 0) return;
    if (!confirm(`Remove ${safeCount} worktree(s) whose PR is merged/closed?`)) return;
    void cleanMergedWorktrees(false);
  };
  const onRestore = () => {
    void restoreWorktree();
  };

  return (
    <div class="wt-panel">
      <div class="wt-panel-head">
        <div>
          <h2>Worktrees</h2>
          <p>{repoLabel}</p>
        </div>
        <div class="wt-panel-actions">
          <button type="button" class="btn sm btn-secondary" disabled={loading} onClick={onRefresh}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <button type="button" class="btn sm btn-ghost" onClick={onRestore}>
            Restore main
          </button>
          <button type="button" class="btn sm btn-primary" disabled={safeCount === 0} onClick={onCleanMerged}>
            Clean merged ({safeCount})
          </button>
        </div>
      </div>
      <div class="wt-rows">
        {loading && list.length === 0 ? <div class="wt-empty">Loading worktrees…</div> : null}
        {!loading && err ? <div class="wt-empty error">{err}</div> : null}
        {!loading && !err && list.length === 0 ? <div class="wt-empty">No Forge worktrees in this repo.</div> : null}
        {list.map((entry) => (
          <WorktreeRow key={entry.path} entry={entry} />
        ))}
      </div>
    </div>
  );
}
