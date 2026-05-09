import { effect } from "@preact/signals";
import { render } from "preact";
import { App } from "./components/App";
import { derivePickups } from "./components/pickup/PickupRow";
import type { ForgeBridge, ForgeLegacyBridge } from "./lib/forge-bridge";
import { repos } from "./signals/repos";
import { refreshSettings, settingsConfig, startSettingsPolling } from "./signals/settings";
import {
  currentTab,
  currentTaskId,
  lastRefreshAt,
  lastRefreshOk,
  refreshTasks,
  selectTask,
  startTaskPolling,
  tasks,
  visibleTasks,
} from "./signals/tasks";
import { theme } from "./signals/theme";
import { modalOpen, searchQuery, selectedRepo, viewMode } from "./signals/ui";

// Expose signals + effect to legacy `src/web/*.js` so they can read/write
// the same state Preact owns. main.tsx runs before app.js (script tag
// order in index.html), so by the time app.js executes the bridge is ready.

const legacy: ForgeLegacyBridge = {};
const bridge: ForgeBridge = {
  signals: { searchQuery, selectedRepo, viewMode, theme, repos, tasks, currentTaskId, currentTab, modalOpen },
  effect,
  legacy,
  api: { refreshTasks, selectTask },
};
window.__forge = bridge;

const root = document.getElementById("app");
if (root) render(<App />, root);

// Phase 3 owns the 3s task poll. Legacy app.js still kicks off the
// initial repo / context fetches and starts repo + PR pollers.
startTaskPolling();
// Phase 4: 30s settings poll. The poll only runs while viewMode ===
// "settings"; SettingsForm reads settingsConfig once on mount, so a
// poll mid-edit won't recreate the inputs and lose focus.
startSettingsPolling();

// When the user enters settings mode (or switches repos while in
// settings mode), kick off a fresh fetch so the form has data to seed
// from. Mounting `<SettingsForm/>` also triggers a fetch if the signal
// is null — this effect just keeps things in sync after re-entry.
effect(() => {
  if (viewMode.value !== "settings") return;
  void refreshSettings(selectedRepo.value || null);
});

// Drop cached settingsConfig when leaving settings mode so a re-entry
// re-seeds the form from a fresh fetch (matches legacy behavior where
// the form was rebuilt from scratch on every enterSettingsMode call).
effect(() => {
  if (viewMode.value !== "settings") settingsConfig.value = null;
});

// Sidebar nav counts and the topbar refresh dot/clock are still rendered
// by Preact components, but the count <span>s themselves are intentionally
// opaque to Preact's diff (Sidebar uses dangerouslySetInnerHTML="" so it
// won't clobber legacy/effect writes). We update them here on every
// signal change. textContent writes don't recreate nodes, so no input
// loses focus.
effect(() => {
  const visible = visibleTasks.value;
  const map = { running: 0, ready: 0, drafting: 0, done: 0 };
  for (const t of visible) {
    if (t.section in map) (map as Record<string, number>)[t.section]++;
  }
  const setText = (id: string, n: number | string) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(n);
  };
  setText("count-pickup", derivePickups(visible).length);
  setText("count-running", map.running);
  setText("count-backlog", map.ready + map.drafting);
  setText("count-done", map.done);
});

// The topbar refresh dot + footer "last refresh" timestamp are also DOM
// nodes that Preact leaves alone — write to them when the poll updates.
effect(() => {
  const ok = lastRefreshOk.value;
  const at = lastRefreshAt.value;
  const dot = document.getElementById("refresh-dot");
  if (dot) dot.classList.toggle("stale", !ok);
  const foot = document.getElementById("foot-refreshed");
  if (foot && at) foot.textContent = at.toLocaleTimeString();
});

// Body class signals "single-repo filter active" so styles can collapse
// the repo column. Legacy applyFilter() did this — we replicate via a
// signal-driven effect.
effect(() => {
  document.body.classList.toggle("filtered-single", !!selectedRepo.value);
});
