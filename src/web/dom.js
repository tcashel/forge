export const $ = (sel, root) => (root || document).querySelector(sel);
export const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

export const escapeHTML = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );

export function showToast(msg, kind) {
  const old = $(".toast");
  if (old) old.remove();
  const t = document.createElement("div");
  t.className = `toast ${kind || "info"}`;
  t.innerHTML = `${escapeHTML(msg)} <button title="Dismiss">×</button>`;
  t.querySelector("button").addEventListener("click", () => t.remove());
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 6000);
}
