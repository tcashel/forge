import { effect } from "@preact/signals";
import { render } from "preact";
import { App } from "./components/App";
import type { ForgeBridge, ForgeLegacyBridge } from "./lib/forge-bridge";
import { repos } from "./signals/repos";
import { theme } from "./signals/theme";
import { searchQuery, selectedRepo, viewMode } from "./signals/ui";

// Expose signals + effect to legacy `src/web/*.js` so they can read/write
// the same state Preact owns. main.tsx runs before app.js (script tag
// order in index.html), so by the time app.js executes the bridge is ready.

const legacy: ForgeLegacyBridge = {};
const bridge: ForgeBridge = {
  signals: { searchQuery, selectedRepo, viewMode, theme, repos },
  effect,
  legacy,
};
window.__forge = bridge;

const root = document.getElementById("app");
if (root) render(<App />, root);
