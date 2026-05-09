import { effect } from "@preact/signals";
import { render } from "preact";
import { App } from "./components/App";
import { derivePickups } from "./components/pickup/PickupRow";
import type { ForgeBridge, ForgeLegacyBridge } from "./lib/forge-bridge";
import { repos } from "./signals/repos";
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
import { searchQuery, selectedRepo, viewMode } from "./signals/ui";

// Expose signals + effect to legacy `src/web/*.js` so they can read/write
// the same state Preact owns. main.tsx runs before app.js (script tag
// order in index.html), so by the time app.js executes the bridge is ready.

const legacy: ForgeLegacyBridge = {};
const bridge: ForgeBridge = {
  signals: { searchQuery, selectedRepo, viewMode, theme, repos, tasks, currentTaskId, currentTab },
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
