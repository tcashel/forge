// Debug surface that exposes the central Preact signal bag plus the
// signals `effect()` helper on `window.__forge`. After Phase 6 the
// workbench has no legacy `.js` consumers — every component imports
// signals directly. This bridge stays only because external tooling
// (Claude-in-Chrome scripts, browser-console debugging) reads
// `window.__forge.signals.modalOpen.value` and friends to drive the
// UI. Don't widen the surface beyond that purpose.

import type { effect as effectFn, Signal } from "@preact/signals";
import type { PlanView, RepoView, TabId, Theme, ViewMode } from "../types";

export interface ForgeSignalBag {
  searchQuery: Signal<string>;
  selectedRepo: Signal<string>;
  viewMode: Signal<ViewMode>;
  theme: Signal<Theme>;
  repos: Signal<RepoView[]>;
  tasks: Signal<PlanView[]>;
  currentTaskId: Signal<string | null>;
  currentTab: Signal<TabId>;
  modalOpen: Signal<boolean>;
}

export interface ForgeApi {
  refreshTasks: () => Promise<void>;
  selectTask: (id: string, tab?: TabId) => void;
}

export interface ForgeBridge {
  signals: ForgeSignalBag;
  effect: typeof effectFn;
  api: ForgeApi;
}

declare global {
  interface Window {
    __forge?: ForgeBridge;
  }
}
