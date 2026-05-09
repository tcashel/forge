// Global keyboard shortcuts not owned by a single component. Replaces
// the legacy `n`-key handler from app.js. The Search component owns
// ⌘K and `/`, RepoPicker owns `r`, the modal owns its own Escape.
import { modalOpen } from "../signals/ui";

function isFieldTarget(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null;
  if (!el?.matches) return false;
  return el.matches("input,textarea,select");
}

export function startGlobalShortcuts(): () => void {
  const onKey = (e: KeyboardEvent) => {
    if (modalOpen.value) return;
    if (isFieldTarget(e.target)) return;
    if (e.key === "n" && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      modalOpen.value = true;
    }
  };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}
