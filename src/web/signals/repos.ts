// Repos signal + 30s background poll. Replaces the legacy `refreshRepos`
// in app.js plus the `setInterval(refreshRepos, 30_000)` boot wiring.
//
// The poll only writes to data signals; no DOM nodes are recreated, so
// any input or scroll position in unrelated views survives the tick.
import { signal } from "@preact/signals";
import { apiGet } from "../lib/api";
import { repoKey } from "../lib/format";
import type { RepoView, WorkbenchContext } from "../types";
import { selectedRepo } from "./ui";

export const repos = signal<RepoView[]>([]);
export const currentRepoFromContext = signal<WorkbenchContext["currentRepo"]>(null);

export async function refreshRepos(): Promise<void> {
  try {
    const data = await apiGet<{ repos: RepoView[] }>("/api/repos");
    repos.value = data.repos || [];
    if (selectedRepo.value && !repos.value.some((r) => repoKey(r) === selectedRepo.value)) {
      selectedRepo.value = "";
    }
  } catch {
    repos.value = [];
  }
}

let pollHandle: ReturnType<typeof setInterval> | null = null;

export function startReposPolling(): void {
  if (pollHandle != null) return;
  pollHandle = setInterval(() => {
    void refreshRepos();
  }, 30_000);
}

export function stopReposPolling(): void {
  if (pollHandle != null) {
    clearInterval(pollHandle);
    pollHandle = null;
  }
}
