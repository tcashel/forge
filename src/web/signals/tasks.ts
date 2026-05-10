// Task state signals + the 3s task poll. Replaces legacy `app.js`'s
// `state.tasks` / `state.currentTaskId` / `state.currentTab` and the
// `setInterval(refreshTasks, 3000)` boot wiring.
//
// Polling writes only to data signals; no DOM nodes are recreated by
// the poll, so the search input (and any future Preact-controlled input)
// keeps focus across ticks.
import { computed, signal } from "@preact/signals";
import { type ApiError, getTasks } from "../lib/api";
import { taskRepoKey } from "../lib/format";
import { showToast } from "../lib/toast";
import type { TabId, TaskView } from "../types";
import { searchQuery, selectedRepo } from "./ui";

export const tasks = signal<TaskView[]>([]);
export const currentTaskId = signal<string | null>(null);
export const currentTab = signal<TabId>("spec");
export const lastRefreshAt = signal<Date | null>(null);
export const lastRefreshOk = signal<boolean>(true);

export const visibleTasks = computed<TaskView[]>(() => {
  const sel = selectedRepo.value;
  let list = sel ? tasks.value.filter((t) => taskRepoKey(t) === sel) : tasks.value.slice();
  const q = (searchQuery.value || "").toLowerCase().trim();
  if (q) {
    list = list.filter((t) => {
      const hay = [t.id, t.title, t.branch, t.repo, t.repoRoot, t.agentLabel || "", t.blurb || ""]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }
  return list;
});

export const currentTask = computed<TaskView | null>(() => {
  const id = currentTaskId.value;
  if (!id) return null;
  return tasks.value.find((t) => t.id === id) ?? null;
});

let pollHandle: ReturnType<typeof setInterval> | null = null;

export async function refreshTasks(): Promise<void> {
  try {
    const data = await getTasks();
    tasks.value = data.tasks || [];
    lastRefreshOk.value = true;
    lastRefreshAt.value = new Date();
  } catch (e) {
    lastRefreshOk.value = false;
    const err = e as ApiError;
    showToast(`Refresh failed: ${err.message}`, "error");
  }
}

export function startTaskPolling(): void {
  if (pollHandle != null) return;
  pollHandle = setInterval(() => {
    void refreshTasks();
  }, 3000);
}

export function stopTaskPolling(): void {
  if (pollHandle != null) {
    clearInterval(pollHandle);
    pollHandle = null;
  }
}

// Picks a sensible default tab when a task is selected without an
// explicit override. Mirrors legacy selectTask().
export function defaultTabFor(t: TaskView): TabId {
  if (t.section === "running") return "log";
  if (t.kind === "critique-ready") return "critique";
  return "spec";
}

export function selectTask(id: string, tab?: TabId): void {
  const t = tasks.value.find((x) => x.id === id);
  if (!t) return;
  currentTaskId.value = id;
  currentTab.value = tab || defaultTabFor(t);
}
