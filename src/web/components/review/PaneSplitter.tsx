import { reviewNavBounds, reviewNavWidth, reviewRailBounds, reviewRailWidth } from "../../signals/layout";

interface Props {
  side: "nav" | "rail";
}

/**
 * Thin draggable divider that resizes the adjacent review pane. Drag to
 * resize, double-click to reset to the default width; collapsing is handled
 * by the pane-header chevrons. Uses mouse events (not pointer events) so the
 * drag is driven by the same input every browser and automation harness
 * emits; the window-level listeners keep the drag alive when the cursor
 * outruns the 6px handle.
 */
export function PaneSplitter({ side }: Props) {
  const width = side === "nav" ? reviewNavWidth : reviewRailWidth;
  const bounds = side === "nav" ? reviewNavBounds : reviewRailBounds;
  // The nav grows as the cursor moves right; the rail grows as it moves left.
  const dir = side === "nav" ? 1 : -1;

  const onMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    // preventDefault suppresses focus-on-click, so focus explicitly to keep
    // the keyboard resize (arrow keys) reachable right after a drag.
    (e.currentTarget as HTMLElement).focus();
    const startX = e.clientX;
    const startW = width.value;
    const prevCursor = document.body.style.cursor;
    const prevSelect = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMove = (ev: MouseEvent) => {
      const next = startW + dir * (ev.clientX - startX);
      width.value = Math.min(bounds.max, Math.max(bounds.min, next));
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevSelect;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // Keyboard resize: arrows nudge, Home/End jump to the bounds. The arrow
  // direction matches the drag direction (right-arrow widens the nav, narrows
  // the rail) so the handle behaves the same however you grab it.
  const onKeyDown = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 32 : 8;
    let next: number | null = null;
    if (e.key === "ArrowLeft") next = width.value - dir * step;
    else if (e.key === "ArrowRight") next = width.value + dir * step;
    else if (e.key === "Home") next = side === "nav" ? bounds.min : bounds.max;
    else if (e.key === "End") next = side === "nav" ? bounds.max : bounds.min;
    if (next === null) return;
    e.preventDefault();
    width.value = Math.min(bounds.max, Math.max(bounds.min, next));
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: focusable, valued window-splitter (ARIA APG) — an <hr> can't carry the resize role.
    <div
      class={`review-splitter for-${side}`}
      role="separator"
      tabIndex={0}
      aria-orientation="vertical"
      aria-label={`Resize ${side === "nav" ? "files" : "findings"} panel`}
      aria-valuemin={bounds.min}
      aria-valuemax={bounds.max}
      aria-valuenow={Math.round(width.value)}
      title="Drag to resize · double-click to reset"
      onMouseDown={onMouseDown}
      onKeyDown={onKeyDown}
      onDblClick={() => {
        width.value = bounds.def;
      }}
    />
  );
}
