// Page-visibility helpers for the polling loops. Polls skip their tick
// while the tab is hidden (a backgrounded Workbench was still hitting
// /api/plans every 3s and /api/prs every 30s); on return to visible the
// registered callbacks fire once so the UI catches up immediately
// instead of waiting out the interval.

export function isHidden(): boolean {
  return typeof document !== "undefined" && document.hidden;
}

const visibleCallbacks = new Set<() => void>();
let wired = false;

/** Run `cb` every time the page transitions hidden → visible. Returns an unsubscribe. */
export function onVisible(cb: () => void): () => void {
  visibleCallbacks.add(cb);
  if (!wired && typeof document !== "undefined") {
    wired = true;
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) return;
      for (const fn of visibleCallbacks) fn();
    });
  }
  return () => visibleCallbacks.delete(cb);
}
