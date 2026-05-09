// Mode transitions for the sidebar / topbar nav. Replaces legacy
// `enterTaskMode` / `enterPrMode` / `enterSettingsMode` from app.js.
//
// Preact components read viewMode directly; these helpers handle the
// extra side effects (mobile-switch button activation + scroll into
// view) the legacy functions were responsible for.
import { currentTaskId } from "../signals/tasks";
import { viewMode } from "../signals/ui";

export function clearDetail(): void {
  currentTaskId.value = null;
}

function setMobileButtonActive(workActive: boolean, prsActive: boolean) {
  const work = document.getElementById("mobile-work-btn");
  const prs = document.getElementById("mobile-prs-btn");
  work?.classList.toggle("active", workActive);
  prs?.classList.toggle("active", prsActive);
}

export function enterTaskMode(target: string = "all"): void {
  viewMode.value = "tasks";
  setMobileButtonActive(true, false);
  if (target === "all") {
    document.getElementById("list-pane")?.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    // Wait one microtask for Preact to render the section headers, then scroll.
    queueMicrotask(() => {
      const listPane = document.getElementById("list-pane");
      const header = listPane?.querySelector(`.section-h[data-section="${target}"]`);
      if (header) header.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

export function enterPrMode(): void {
  viewMode.value = "prs";
  setMobileButtonActive(false, true);
  clearDetail();
}

export function enterSettingsMode(): void {
  viewMode.value = "settings";
  setMobileButtonActive(false, false);
  clearDetail();
}
