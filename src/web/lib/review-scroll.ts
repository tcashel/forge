// Scroll-to-anchor helpers shared by the left nav and findings rail. The
// diff pane carries DOM ids of the form `diff-row-<file>-<position>` and
// `diff-file-<file>`. Clicking a finding/file opens the surrounding
// <details> if collapsed, scrolls the target into view, and (for
// findings) applies a brief highlight class so the operator can see what
// they just jumped to.

const HIGHLIGHT_MS = 1400;

export function rowDomId(filePath: string, diffPosition: number): string {
  return `diff-row-${filePath}-${diffPosition}`;
}

export function fileDomId(filePath: string): string {
  return `diff-file-${filePath}`;
}

function openContainingDetails(el: HTMLElement | null): void {
  let cursor: HTMLElement | null = el;
  while (cursor) {
    if (cursor.tagName === "DETAILS") {
      const d = cursor as HTMLDetailsElement;
      if (!d.open) d.open = true;
    }
    cursor = cursor.parentElement;
  }
}

export function scrollToFile(filePath: string): void {
  const el = document.getElementById(fileDomId(filePath));
  if (!el) return;
  openContainingDetails(el);
  el.scrollIntoView({ block: "start", behavior: "smooth" });
}

export function scrollToFinding(filePath: string, diffPosition: number): void {
  const id = rowDomId(filePath, diffPosition);
  const el = document.getElementById(id);
  if (!el) return;
  openContainingDetails(el);
  el.scrollIntoView({ block: "center", behavior: "smooth" });
  el.classList.add("review-row-flash");
  window.setTimeout(() => {
    el.classList.remove("review-row-flash");
  }, HIGHLIGHT_MS);
}
