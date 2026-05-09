// Backing store. Phase 2 + Phase 3: a growing list of fields (repos,
// selectedRepo, searchQuery, viewMode, tasks, currentTaskId, currentTab)
// now live in Preact signals exposed by main.tsx as
// `window.__forge.signals.*`. We expose them as getter/setter properties
// on the legacy `state` object so existing legacy code continues to work
// unchanged. The legacy `state.x` reads/writes always go through the
// signal layer — no duplicated storage.

// PR state (prs / prMe / prsRepo / prsRepoRoot / prFilterMine /
// selectedPrNumber / prsLoading / prsError) lives in
// `src/web/signals/prs.ts` after Phase 5 — Preact components read it
// directly and no legacy code touches `state.pr*` anymore.
const _local = {
  context: null,
  lastDetailFp: "",
  logSource: null,
  refreshTimer: null,
};

function bridgeSignal(name) {
  return window.__forge?.signals?.[name];
}

export const state = Object.defineProperties(_local, {
  repos: {
    enumerable: true,
    get() { return bridgeSignal("repos")?.value ?? []; },
    set(v) { const s = bridgeSignal("repos"); if (s) s.value = v ?? []; },
  },
  selectedRepo: {
    enumerable: true,
    get() { return bridgeSignal("selectedRepo")?.value ?? ""; },
    set(v) { const s = bridgeSignal("selectedRepo"); if (s) s.value = v ?? ""; },
  },
  searchQuery: {
    enumerable: true,
    get() { return bridgeSignal("searchQuery")?.value ?? ""; },
    set(v) { const s = bridgeSignal("searchQuery"); if (s) s.value = v ?? ""; },
  },
  viewMode: {
    enumerable: true,
    get() { return bridgeSignal("viewMode")?.value ?? "tasks"; },
    set(v) { const s = bridgeSignal("viewMode"); if (s) s.value = v ?? "tasks"; },
  },
  tasks: {
    enumerable: true,
    get() { return bridgeSignal("tasks")?.value ?? []; },
    set(v) { const s = bridgeSignal("tasks"); if (s) s.value = v ?? []; },
  },
  currentTaskId: {
    enumerable: true,
    get() { return bridgeSignal("currentTaskId")?.value ?? null; },
    set(v) { const s = bridgeSignal("currentTaskId"); if (s) s.value = v ?? null; },
  },
  currentTab: {
    enumerable: true,
    get() { return bridgeSignal("currentTab")?.value ?? "spec"; },
    set(v) { const s = bridgeSignal("currentTab"); if (s) s.value = v ?? "spec"; },
  },
});
