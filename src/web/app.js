"use strict";

import { apiGet, apiPost } from "./api.js";
import { $, escapeHTML, showToast } from "./dom.js";
import { CUSTOM_REPO_VALUE } from "./modal.js";
import { clearPrModeShell, refreshPrs, renderPrMode, updatePrCount } from "./prs.js";
import { repoKey } from "./repo-picker.js";
import { clearSettingsModeShell, refreshSettings, renderSettingsMode } from "./settings.js";
import { state } from "./state.js";

/* The Preact shell (src/web/components/App.tsx) renders the topbar,
   sidebar, repo picker, search, theme toggle, clock, the pickup
   section, the task list, and the task detail (head + tabs + read-only
   tab bodies). Legacy code in this file is now responsible only for:

   - Initial /api/workbench/context + /api/repos hydration
   - PRs and Settings mode legacy renderers (Phase 4 / Phase 5 will move them)
   - The new-spec modal (Phase 4 will move it)
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
   the legacy mode renderers (PR list, settings form) when a repo filter
   changes. The Preact task views read directly from signals and don't
   need it. */
function applyFilter() {
  if (state.viewMode === "prs") {
    renderPrMode(state);
  } else if (state.viewMode === "settings") {
    renderSettingsMode(state);
  }
}

function clearDetail() {
  state.currentTaskId = null;
}

function clearLegacyPaneContent() {
  // PRs / Settings legacy code wrote into #list-pane and #detail-pane
  // via innerHTML, bypassing Preact. When tasks mode re-mounts, Preact's
  // diff has no record of those legacy children and would just append
  // its new children alongside the leftover markup. Reset the panes
  // here so the upcoming Preact re-mount paints into clean DOM.
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
  clearSettingsModeShell();
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
   pane DOM. Without this, renderPrMode/renderSettingsMode would run
   while Preact's task subtrees are still mounted, and Preact would
   unmount over the legacy markup on its scheduled flush. */
function afterPreactFlush() {
  return new Promise((resolve) => queueMicrotask(resolve));
}

async function enterPrMode() {
  state.viewMode = "prs";
  $("#mobile-prs-btn")?.classList.add("active");
  $("#mobile-work-btn")?.classList.remove("active");
  clearSettingsModeShell();
  clearDetail();
  await afterPreactFlush();
  renderPrMode(state);
  await refreshPrs(state, { render: () => renderPrMode(state) });
}

async function enterSettingsMode() {
  state.viewMode = "settings";
  $("#mobile-work-btn")?.classList.remove("active");
  $("#mobile-prs-btn")?.classList.remove("active");
  clearPrModeShell();
  clearDetail();
  await afterPreactFlush();
  renderSettingsMode(state);
  await refreshSettings(state, { render: () => renderSettingsMode(state) });
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

/* ─── new spec modal ──────────────────────────────────────────────── */

function openNewSpecModal() {
  const modal = $("#new-spec-modal");
  const repoSel = $("#new-spec-repo");
  const known = state.repos.filter((r) => !r.stale).map((r) =>
    `<option value="${escapeHTML(r.root)}">${escapeHTML(r.name)} (${escapeHTML(r.root)})</option>`
  ).join("");
  repoSel.innerHTML = `${known}<option value="${CUSTOM_REPO_VALUE}">Custom path…</option>`;
  $("#new-spec-submit").disabled = false;
  const selected = state.repos.find((r) => repoKey(r) === state.selectedRepo && !r.stale);
  if (selected) repoSel.value = selected.root;
  else if (state.repos[0]) repoSel.value = state.repos[0].root;
  else repoSel.value = CUSTOM_REPO_VALUE;
  toggleRepoCustomField();
  modal.hidden = false;
  setTimeout(() => {
    if (repoSel.value === CUSTOM_REPO_VALUE) $("#new-spec-repo-custom").focus();
    else $("#new-spec-body").focus();
  }, 0);
}

function toggleRepoCustomField() {
  const isCustom = $("#new-spec-repo").value === CUSTOM_REPO_VALUE;
  $("#new-spec-repo-custom-wrap").hidden = !isCustom;
  if (isCustom) $("#new-spec-repo-custom").focus();
}

function closeNewSpecModal() {
  const modal = $("#new-spec-modal");
  modal.hidden = true;
  $("#new-spec-form").reset();
  $("#new-spec-submit").disabled = false;
  $("#new-spec-submit").textContent = "Save spec";
}

$("#new-spec-close").addEventListener("click", closeNewSpecModal);
$("#new-spec-cancel").addEventListener("click", closeNewSpecModal);
$("#new-spec-modal").addEventListener("click", (e) => {
  if (e.target.id === "new-spec-modal") closeNewSpecModal();
});
$("#new-spec-repo").addEventListener("change", toggleRepoCustomField);

/* Modal focus trap: Tab inside the modal cycles between its focusables. */
$("#new-spec-modal").addEventListener("keydown", (e) => {
  if (e.key !== "Tab") return;
  const card = $("#new-spec-modal .modal-card");
  const focusable = card.querySelectorAll(
    'button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (focusable.length === 0) return;
  const visible = Array.from(focusable).filter((el) => !el.disabled && el.offsetParent !== null);
  if (visible.length === 0) return;
  const first = visible[0];
  const last = visible[visible.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

$("#new-spec-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  let repoRoot = $("#new-spec-repo").value.trim();
  if (repoRoot === CUSTOM_REPO_VALUE) {
    repoRoot = $("#new-spec-repo-custom").value.trim();
  }
  const markdown = $("#new-spec-body").value;
  const title = $("#new-spec-title").value.trim();
  const agent = $("#new-spec-agent").value;
  const model = $("#new-spec-model").value.trim();
  const autoImprove = $("#new-spec-improve").checked;

  if (!repoRoot) { showToast("Pick a repo or enter a custom path.", "error"); return; }
  if (!markdown.trim()) { showToast("Markdown body is required.", "error"); return; }

  const submit = $("#new-spec-submit");
  submit.disabled = true;
  submit.textContent = "Saving…";

  const body = {
    markdown,
    repoRoot,
    autoImprove: false,
    ...(title ? { title } : {}),
    ...(agent ? { agent } : {}),
    ...(model ? { model } : {}),
  };

  try {
    const data = await apiPost("/api/specs", body);
    closeNewSpecModal();
    await refreshTasksBridge();
    if (data.taskId) selectTaskBridge(data.taskId);

    if (autoImprove && data.taskId) {
      showToast(`Saved ${data.taskId} — auto-improve running in background…`, "info");
      apiPost(`/api/tasks/${encodeURIComponent(data.taskId)}/improve`, {}).catch((err) => {
        showToast(err.hint ? `Auto-improve failed: ${err.message} — ${err.hint}` : `Auto-improve failed: ${err.message}`, "error");
      });
    } else {
      showToast(`Saved spec ${data.taskId}`, "info");
    }
  } catch (err) {
    const msg = err.hint ? `${err.message} — ${err.hint}` : (err.message || "Save failed");
    showToast(msg, "error");
    submit.disabled = false;
    submit.textContent = "Save spec";
  }
});

/* Modal-only keyboard handler. Search-bar focus, '/' / ⌘K, 'r' (repo
   popover), and Escape-clears-search are owned by Preact components in
   <Search /> and <RepoPicker />. We only need: Escape closes the
   currently-open new-spec modal, and 'n' opens it. */
window.addEventListener("keydown", (e) => {
  if (!$("#new-spec-modal").hidden) {
    if (e.key === "Escape") { e.preventDefault(); closeNewSpecModal(); }
    return;
  }
  if (e.target.matches("input,textarea,select")) return;
  if (e.key === "n" && !e.metaKey && !e.ctrlKey) { e.preventDefault(); openNewSpecModal(); }
});

/* ─── Preact ↔ legacy bridge ──────────────────────────────────────── */

/* Register legacy callbacks that the Preact shell (sidebar, repo picker,
   topbar, search) dispatches into. main.tsx publishes the signal bag
   first, so window.__forge is already populated by the time this script
   runs. */
function setSelectedRepoFromBridge(key) {
  state.selectedRepo = key || "";
  if (state.viewMode === "prs") refreshPrs(state, { render: () => renderPrMode(state) });
  if (state.viewMode === "settings") refreshSettings(state, { render: () => renderSettingsMode(state) });
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
    openNewSpecModal,
  });
}

boot();
