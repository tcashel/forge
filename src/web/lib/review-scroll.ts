// Scroll-to-anchor helpers shared by the left nav and findings rail. Diff
// rows/widgets carry DOM ids of the form `diff-row-<file>-<position>` and
// each file wrapper `diff-file-<file>`. Clicking a finding/file expands the
// target file if it was collapsed (viewed), scrolls it into view, and (for
// findings) applies a brief highlight class.
//
// Collapse is now signal-driven (a viewed file unmounts its diff body), so
// reaching a collapsed target means flipping the expand override first and
// waiting for the diff to mount before scrolling.

import { ensureFileExpanded } from "../signals/review";

const HIGHLIGHT_MS = 1400;
const SCROLL_RETRY_MS = 50;
const SCROLL_MAX_TRIES = 16;

export function rowDomId(filePath: string, diffPosition: number): string {
  return `diff-row-${filePath}-${diffPosition}`;
}

export function fileDomId(filePath: string): string {
  return `diff-file-${filePath}`;
}

// Poll for an element that may still be mounting (the diff body renders
// asynchronously after a collapsed file is expanded), then run `onFound`.
function whenElement(id: string, onFound: (el: HTMLElement) => void): void {
  let tries = 0;
  const attempt = () => {
    const el = document.getElementById(id);
    if (el) {
      onFound(el);
      return;
    }
    if (++tries >= SCROLL_MAX_TRIES) return;
    window.setTimeout(attempt, SCROLL_RETRY_MS);
  };
  attempt();
}

export function scrollToFile(filePath: string): void {
  ensureFileExpanded(filePath);
  whenElement(fileDomId(filePath), (el) => {
    el.scrollIntoView({ block: "start", behavior: "smooth" });
  });
}

export function scrollToFinding(filePath: string, diffPosition: number): void {
  // Expand the containing file (no-op if not viewed) so the row exists.
  ensureFileExpanded(filePath);
  whenElement(rowDomId(filePath, diffPosition), (el) => {
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    el.classList.add("review-row-flash");
    window.setTimeout(() => {
      el.classList.remove("review-row-flash");
    }, HIGHLIGHT_MS);
  });
}
