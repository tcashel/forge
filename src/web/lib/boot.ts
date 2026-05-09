// Initial hydration on page load. Replaces the legacy `boot()` from
// app.js. Runs once at startup: fetches workbench context, repos, and
// the initial task list, picks a sensible repo + task default.
import { repoKey } from "../lib/format";
import { currentRepoFromContext, refreshRepos, repos } from "../signals/repos";
import { refreshTasks, selectTask, tasks } from "../signals/tasks";
import { selectedRepo } from "../signals/ui";
import type { WorkbenchContext } from "../types";
import { apiGet } from "./api";

async function refreshContext(): Promise<void> {
  try {
    const data = await apiGet<WorkbenchContext>("/api/workbench/context");
    currentRepoFromContext.value = data?.currentRepo ?? null;
  } catch {
    currentRepoFromContext.value = null;
  }
}

export async function boot(): Promise<void> {
  await refreshContext();
  await refreshRepos();
  if (!selectedRepo.value && currentRepoFromContext.value) {
    const currentRoot = currentRepoFromContext.value.root;
    if (repos.value.some((r) => repoKey(r) === currentRoot)) {
      selectedRepo.value = currentRoot;
    }
  }
  await refreshTasks();
  // Default task selection: first attention candidate, then any running, then anything.
  const list = tasks.value;
  const candidate =
    list.find((t) => t.kind === "critique-ready" || t.kind === "failed") ||
    list.find((t) => t.section === "running") ||
    list[0];
  if (candidate) selectTask(candidate.id);
}
