// Tiny formatting helpers used by Preact components. Mirrors the subset of
// legacy `dom.js` / `render.js` we still need after Phase 3.
import type { TaskView, WorkbenchSection } from "../types";

export function escapeHTML(s: unknown): string {
  return String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c] as string,
  );
}

export function statClass(task: TaskView): WorkbenchSection {
  return task.statClass || "drafting";
}

export function repoChipHTML(repo: string | null | undefined): string {
  if (!repo) return "";
  return `<span class="repo-chip"><span class="repo-dot"></span>${escapeHTML(repo)}</span>`;
}

export function repoKey(repo: { root?: string | null; name?: string | null } | null | undefined): string {
  return repo?.root || repo?.name || "";
}

export function taskRepoKey(task: { repoRoot?: string | null; repo?: string | null } | null | undefined): string {
  return task?.repoRoot || task?.repo || "";
}

export function formatDur(ms: number | null | undefined): string {
  if (typeof ms !== "number") return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}
