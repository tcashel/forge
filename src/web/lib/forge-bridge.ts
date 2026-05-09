// Shim that lets pre-existing legacy `src/web/*.js` files talk to the
// new Preact signal modules. main.tsx populates `window.__forge.signals`
// at startup, and legacy code can register callbacks under
// `window.__forge.legacy.*` so the Preact shell can dispatch nav clicks
// and repo selections back into the legacy state machine.

import type { effect as effectFn, Signal } from "@preact/signals";
import type { RepoView, Theme, ViewMode } from "../types";

export interface ForgeLegacyBridge {
  /** Set selectedRepo and run the legacy applyFilter() pipeline. */
  setSelectedRepo?: (key: string) => void;
  /** Re-run legacy filter pipeline (refresh views after a signal write). */
  applyFilter?: () => void;
  /** Async refresh of repos signal via /api/repos. */
  refreshRepos?: () => Promise<void>;
  /** Show a legacy toast — kept on legacy side for Phase 2. */
  showToast?: (msg: string, kind?: "info" | "error") => void;
  /** Enter the tasks / pickup mode and scroll to a section. */
  enterTaskMode?: (target?: string) => void | Promise<void>;
  /** Enter PRs mode. */
  enterPrMode?: () => void | Promise<void>;
  /** Enter Settings mode. */
  enterSettingsMode?: () => void | Promise<void>;
  /** Open the new-spec modal (legacy still owns it). */
  openNewSpecModal?: () => void;
}

export interface ForgeSignalBag {
  searchQuery: Signal<string>;
  selectedRepo: Signal<string>;
  viewMode: Signal<ViewMode>;
  theme: Signal<Theme>;
  repos: Signal<RepoView[]>;
}

export interface ForgeBridge {
  signals: ForgeSignalBag;
  effect: typeof effectFn;
  legacy: ForgeLegacyBridge;
}

declare global {
  interface Window {
    __forge?: ForgeBridge;
  }
}
