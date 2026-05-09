"use strict";

import { apiGet } from "./api.js";
import { $, showToast } from "./dom.js";
import { clearPrModeShell, refreshPrs, renderPrMode, updatePrCount } from "./prs.js";
import { repoKey } from "./repo-picker.js";
import { state } from "./state.js";

/* The Preact shell (src/web/components/App.tsx) renders the topbar,
   sidebar, repo picker, search, theme toggle, clock, the pickup
   section, the task list, the task detail (head + tabs + read-only
   tab bodies), the settings view, and the new-spec modal. Legacy
   code in this file is now responsible only for:

   - Initial /api/workbench/context + /api/repos hydration
   - PRs mode legacy renderer (Phase 5 will move it)
   - The 30s repos poll + 30s PR-count poll
   - Mode transitions (enterTaskMode / enterPrMode / enterSettingsMode)
*/

function selectTaskBridge(id, tab) {
  window.__forge?.api?.selectTask?.(id, tab);
}

function refreshTasksBridge() {
  return window.__forge?.api?.refreshTasks?.() ?? Promise.resolve();
}

/* ─── filtering ────────────────────────────────────────────────────── */
/* Legacy callers (sidebar nav, repo picker) call applyFilter() to nudge
   the legacy mode renderers (PR list) when a repo filter changes. The
   Preact task and settings views read directly from signals and don't
   need it. */
function applyFilter() {
  if (state.viewMode === "prs") {
    renderPrMode(state);
  }
}

function clearDetail() {
  state.currentTaskId = null;
}

function clearLegacyPaneContent() {
  // PRs legacy code wrote into #list-pane and #detail-pane via
  // innerHTML, bypassing Preact. When tasks/settings mode re-mounts,
  // Preact's diff has no record of those legacy children and would
  // just append its new children alongside the leftover markup. Reset
  // the panes here so the upcoming Preact re-mount paints into clean
  // DOM.
  const list = $("#list-pane");
  if (list) list.innerHTML = "";
  const detail = $("#detail-pane");
  if (detail) detail.innerHTML = "";
}

function enterTaskMode(target = "all") {
  const wasOtherMode = state.viewMode !== "tasks";
  if (wasOtherMode) clearLegacyPaneContent();
  state.viewMode = "tasks";
  $("#mobile-work-btn")?.classList.add("active");
  $("#mobile-prs-btn")?.classList.remove("active");
  clearPrModeShell();
  // Preact re-mounts the pickup / list / detail panes via the viewMode
  // signal flip above. No legacy markup injection needed.
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

/* Wait for Preact's signal-driven re-render to flush. @preact/signals
   batches component updates on the microtask after a signal write, so
   we yield once before letting legacy code paint into the now-vacated
   pane DOM. Without this, renderPrMode would run while Preact's task
   subtrees are still mounted, and Preact would unmount over the legacy
   markup on its scheduled flush. */
function afterPreactFlush() {
  return new Promise((resolve) => queueMicrotask(resolve));
}

async function enterPrMode() {
  const wasOtherMode = state.viewMode !== "prs";
  state.viewMode = "prs";
  $("#mobile-prs-btn")?.classList.add("active");
  $("#mobile-work-btn")?.classList.remove("active");
  clearDetail();
  if (wasOtherMode) {
    // Preact-rendered children (settings/tasks) will unmount on the
    // viewMode flip; clear the panes once the flush lands so the
    // legacy renderer paints into empty DOM.
    await afterPreactFlush();
    clearLegacyPaneContent();
  }
  renderPrMode(state);
  await refreshPrs(state, { render: () => renderPrMode(state) });
}

function enterSettingsMode() {
  const wasOtherMode = state.viewMode !== "settings";
  if (wasOtherMode) clearLegacyPaneContent();
  state.viewMode = "settings";
  $("#mobile-work-btn")?.classList.remove("active");
  $("#mobile-prs-btn")?.classList.remove("active");
  clearPrModeShell();
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

async function refreshPrCount() {
  try {
    const data = await apiGet("/api/prs" + (state.selectedRepo ? `?repo=${encodeURIComponent(state.selectedRepo)}` : ""));
    state.prs = data.prs || [];
    state.prMe = data.me || "";
    state.prsRepo = data.repo || null;
    state.prsRepoRoot = data.repoRoot || null;
    state.prsError = null;
    updatePrCount(state);
    if (state.viewMode === "prs") renderPrMode(state);
  } catch {
    state.prsError = "Could not refresh PR count.";
    const cnt = $("#count-prs");
    if (cnt) cnt.textContent = "—";
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
  // The 3s task poll is started by main.tsx via startTaskPolling(). The
  // initial fetch below seeds the signal so the UI doesn't flash empty.
  await refreshTasksBridge();
  refreshPrCount();
  setInterval(refreshRepos, 30_000);
  setInterval(refreshPrCount, 30_000);
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
  if (state.viewMode === "prs") refreshPrs(state, { render: () => renderPrMode(state) });
  // Settings mode reacts via the effect in main.tsx (re-fetches on
  // selectedRepo change). No manual nudge needed here.
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
