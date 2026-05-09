"use strict";

import { apiGet } from "./api.js";
import { $, showToast } from "./dom.js";
import { repoKey } from "./repo-picker.js";
import { state } from "./state.js";

/* The Preact shell (src/web/components/App.tsx) renders the topbar,
   sidebar, repo picker, search, theme toggle, clock, the pickup
   section, the task list, the task detail (head + tabs + read-only
   tab bodies), the PRs list/detail, the settings view, and the
   new-spec modal. Legacy code in this file is now responsible only for:

   - Initial /api/workbench/context + /api/repos hydration
   - The 30s repos poll
   - Mode transitions (enterTaskMode / enterPrMode / enterSettingsMode)
*/

function selectTaskBridge(id, tab) {
  window.__forge?.api?.selectTask?.(id, tab);
}

function refreshTasksBridge() {
  return window.__forge?.api?.refreshTasks?.() ?? Promise.resolve();
}

/* ─── filtering ────────────────────────────────────────────────────── */
/* Preact components read directly from signals; mode renderers no
   longer need a manual nudge when the repo filter changes. Kept as a
   no-op for the bridge so legacy callers don't break. */
function applyFilter() {}

function clearDetail() {
  state.currentTaskId = null;
}

function enterTaskMode(target = "all") {
  state.viewMode = "tasks";
  $("#mobile-work-btn")?.classList.add("active");
  $("#mobile-prs-btn")?.classList.remove("active");
  // Preact re-mounts the pickup / list / detail panes via the viewMode
  // signal flip above.
  if (target === "all") {
    $("#list-pane")?.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    // Wait one microtask for Preact to render the section headers, then scroll.
    queueMicrotask(() => {
      const header = $("#list-pane")?.querySelector(`.section-h[data-section="${target}"]`);
      if (header) header.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

function enterPrMode() {
  state.viewMode = "prs";
  $("#mobile-prs-btn")?.classList.add("active");
  $("#mobile-work-btn")?.classList.remove("active");
  clearDetail();
  // PrList / PrDetail mount via the viewMode signal flip above and the
  // 30s poll started in main.tsx keeps the data fresh; no manual
  // refresh needed here (the poll's data is already current and the
  // component renders from signals immediately).
}

function enterSettingsMode() {
  state.viewMode = "settings";
  $("#mobile-work-btn")?.classList.remove("active");
  $("#mobile-prs-btn")?.classList.remove("active");
  clearDetail();
  // SettingsForm and SettingsRepoList mount via the viewMode signal
  // flip above; main.tsx kicks off the /api/config fetch in an effect.
}

/* ─── data fetch ───────────────────────────────────────────────────── */
async function refreshContext() {
  try {
    state.context = await apiGet("/api/workbench/context");
  } catch {
    state.context = null;
  }
}

async function refreshRepos() {
  try {
    const data = await apiGet("/api/repos");
    state.repos = data.repos || [];
    if (state.selectedRepo && !state.repos.some((r) => repoKey(r) === state.selectedRepo)) {
      state.selectedRepo = "";
    }
  } catch {
    state.repos = [];
  }
}

/* ─── boot ─────────────────────────────────────────────────────────── */
async function boot() {
  await refreshContext();
  await refreshRepos();
  if (!state.selectedRepo && state.context?.currentRepo) {
    const currentRoot = state.context.currentRepo.root;
    if (state.repos.some((r) => repoKey(r) === currentRoot)) state.selectedRepo = currentRoot;
  }
  // The 3s task poll is started by main.tsx via startTaskPolling(); the
  // 30s PR poll is started by main.tsx via startPrPolling(). The initial
  // task fetch below seeds the signal so the UI doesn't flash empty.
  await refreshTasksBridge();
  setInterval(refreshRepos, 30_000);
  // Default selection: first attention candidate, then any running, then anything.
  const list = state.tasks;
  const candidate =
    list.find((t) => t.kind === "critique-ready" || t.kind === "failed") ||
    list.find((t) => t.section === "running") ||
    list[0];
  if (candidate) selectTaskBridge(candidate.id);
}

/* ─── new-spec modal keyboard shortcut ──────────────────────────────── */
/* Modal open/close + form behavior are handled by <NewSpecModal/> in
   Preact. Here we only need to intercept the global 'n' shortcut. The
   modal's own Escape handler closes it. */
window.addEventListener("keydown", (e) => {
  const modalSig = window.__forge?.signals?.modalOpen;
  if (modalSig?.value) return; // modal is open; let it handle its own keys
  if (e.target.matches("input,textarea,select")) return;
  if (e.key === "n" && !e.metaKey && !e.ctrlKey) {
    e.preventDefault();
    if (modalSig) modalSig.value = true;
  }
});

/* ─── Preact ↔ legacy bridge ──────────────────────────────────────── */

/* Register legacy callbacks that the Preact shell (sidebar, repo picker,
   topbar, search) dispatches into. main.tsx publishes the signal bag
   first, so window.__forge is already populated by the time this script
   runs. */
function setSelectedRepoFromBridge(key) {
  state.selectedRepo = key || "";
  // PRs mode reacts via the `effect()` in main.tsx (refreshPrs runs on
  // selectedRepo change). Settings mode reacts via its own effect there.
  // No manual nudge needed here.
}

if (window.__forge) {
  Object.assign(window.__forge.legacy, {
    setSelectedRepo: setSelectedRepoFromBridge,
    applyFilter,
    refreshRepos,
    showToast,
    enterTaskMode,
    enterPrMode,
    enterSettingsMode,
  });
}

boot();
