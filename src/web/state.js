// Backing store. Phase 2: a few fields (repos, selectedRepo, searchQuery,
// viewMode) now live in Preact signals exposed by main.tsx as
// `window.__forge.signals.*`. We expose them as getter/setter properties
// on the legacy `state` object so existing legacy code continues to work
// unchanged.

const _local = {
  context: null,
  tasks: [],
  currentTaskId: null,
  currentTab: "log",
  lastDetailFp: "",
  prs: [],
  prMe: "",
  prsRepo: null,
  prsRepoRoot: null,
  prFilterMine: false,
  prDetailsOpen: true,
  selectedPrNumber: null,
  prsLoading: false,
  prsError: null,
  settingsRepo: null,
  settingsConfig: {},
  settingsLoading: false,
  settingsError: null,
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
});
