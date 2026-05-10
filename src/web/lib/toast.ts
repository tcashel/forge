// Toast helper. Replaces legacy `dom.js` showToast — same DOM shape and
// auto-dismiss timing so styles continue to apply.
import { escapeHTML } from "./format";

export function showToast(msg: string, kind: "info" | "error" = "info"): void {
  const old = document.querySelector(".toast");
  if (old) old.remove();
  const t = document.createElement("div");
  t.className = `toast ${kind}`;
  t.innerHTML = `${escapeHTML(msg)} <button title="Dismiss">×</button>`;
  t.querySelector("button")?.addEventListener("click", () => t.remove());
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 6000);
}
