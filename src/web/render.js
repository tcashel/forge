import { escapeHTML } from "./dom.js";

export function statClass(task) {
  return task.statClass || "drafting";
}

export function repoChipHTML(repo) {
  if (!repo) return "";
  return `<span class="repo-chip"><span class="repo-dot"></span>${escapeHTML(repo)}</span>`;
}
