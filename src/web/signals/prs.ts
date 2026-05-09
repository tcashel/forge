// PR state signals + 30s background poll. Replaces legacy
// `src/web/prs.js` plus `app.js`'s `refreshPrCount` setInterval.
//
// The poll only writes to data signals here; PrList/PrRow/PrDetail
// read these signals via Preact reactivity. Selection (`currentPrNumber`)
// and filter (`prFilterMine`) are component-driven; a poll mid-interaction
// won't recreate any DOM nodes, so focus and scroll position survive.
import { computed, signal } from "@preact/signals";
import { type ApiError, apiGet } from "../lib/api";
import type { PrsResponse, PrView } from "../types";
import { selectedRepo } from "./ui";

export const prs = signal<PrView[]>([]);
export const prMe = signal<string>("");
export const prsRepoName = signal<string | null>(null);
export const prsRepoRoot = signal<string | null>(null);
export const prsLoading = signal<boolean>(false);
export const prsError = signal<string | null>(null);
// Default matches legacy `state.js` (`prFilterMine: false` → "All" tab active).
export const prFilterMine = signal<boolean>(false);
export const currentPrNumber = signal<number | null>(null);

export const visiblePrs = computed<PrView[]>(() => {
  const list = prs.value;
  return prFilterMine.value ? list.filter((p) => p.isMine) : list.slice();
});

export const currentPr = computed<PrView | null>(() => {
  const list = visiblePrs.value;
  const sel = currentPrNumber.value;
  return list.find((p) => p.number === sel) ?? list[0] ?? null;
});

export async function refreshPrs(): Promise<void> {
  prsLoading.value = true;
  try {
    const q = selectedRepo.value ? `?repo=${encodeURIComponent(selectedRepo.value)}` : "";
    const url = `/api/prs${q}`;
    const data = await apiGet<PrsResponse>(url);
    prs.value = data.prs || [];
    prMe.value = data.me || "";
    prsRepoName.value = data.repo || null;
    prsRepoRoot.value = data.repoRoot || null;
    prsError.value = null;
    // If the previously-selected PR is gone (filter swap, list refresh),
    // fall through to the first visible PR. Mirrors legacy refreshPrs.
    const list = visiblePrs.value;
    if (!list.some((p) => p.number === currentPrNumber.value)) {
      currentPrNumber.value = list[0]?.number ?? null;
    }
  } catch (e) {
    const err = e as ApiError;
    prs.value = [];
    prsError.value = err.hint ? `${err.message} — ${err.hint}` : err.message || "Could not load PRs.";
  } finally {
    prsLoading.value = false;
  }
}

let pollHandle: ReturnType<typeof setInterval> | null = null;

// Single 30s poll keeps the sidebar PR count fresh and (when on the PRs
// view) refreshes the visible list. There's no separate count endpoint —
// `/api/prs` returns the full list — so we just call refreshPrs always.
export function startPrPolling(): void {
  if (pollHandle != null) return;
  pollHandle = setInterval(() => {
    void refreshPrs();
  }, 30_000);
}

export function stopPrPolling(): void {
  if (pollHandle != null) {
    clearInterval(pollHandle);
    pollHandle = null;
  }
}
