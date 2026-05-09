"use strict";

import { apiGet } from "./api.js";
import { copyCmd } from "./actions.js";
import { $, escapeHTML } from "./dom.js";
import { selectedRepoName } from "./repo-picker.js";

function prEndpoint(state) {
  return `/api/prs${state.selectedRepo ? `?repo=${encodeURIComponent(state.selectedRepo)}` : ""}`;
}

function timeAgo(iso) {
  if (!iso) return "—";
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms)) return "—";
  if (ms < 60_000) return `${Math.max(1, Math.round(ms / 1000))}s`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m`;
  if (ms < 86_400_000) return `${Math.round(ms / 3_600_000)}h`;
  return `${Math.round(ms / 86_400_000)}d`;
}

function ciClass(status) {
  if (status === "SUCCESS") return "pass";
  if (status === "FAILURE" || status === "ERROR") return "fail";
  if (status === "PENDING") return "pend";
  return "none";
}

function ciLabel(status) {
  if (status === "SUCCESS") return "CI pass";
  if (status === "FAILURE" || status === "ERROR") return "CI fail";
  if (status === "PENDING") return "CI pending";
  return "CI none";
}

function reviewClass(decision) {
  if (decision === "APPROVED") return "pass";
  if (decision === "CHANGES_REQUESTED") return "fail";
  if (decision === "REVIEW_REQUIRED") return "pend";
  return "none";
}

function reviewLabel(decision) {
  if (decision === "APPROVED") return "review ok";
  if (decision === "CHANGES_REQUESTED") return "changes";
  if (decision === "REVIEW_REQUIRED") return "review needed";
  return "no review";
}

function visiblePrs(state) {
  return state.prFilterMine ? state.prs.filter((p) => p.isMine) : state.prs.slice();
}

function selectedPr(state) {
  const list = visiblePrs(state);
  return list.find((p) => p.number === state.selectedPrNumber) || list[0] || null;
}

function repoLabel(state) {
  return state.prsRepo || selectedRepoName(state) || "selected repo";
}

function renderPrRow(pr, selected) {
  const draft = pr.isDraft ? '<span class="pr-tag">draft</span>' : "";
  const mine = pr.isMine ? '<span class="pr-tag mine">mine</span>' : "";
  return `
    <button class="pr-row ${selected ? "selected" : ""}" data-pr-number="${pr.number}">
      <span class="pr-num">#${pr.number}</span>
      <span class="pr-main">
        <span class="pr-title">${escapeHTML(pr.title)}</span>
        <span class="pr-meta">
          <span>${escapeHTML(pr.headRefName)}</span>
          <span>→</span>
          <span>${escapeHTML(pr.baseRefName)}</span>
          <span>·</span>
          <span>@${escapeHTML(pr.author || "unknown")}</span>
        </span>
      </span>
      <span class="pr-badges">
        ${draft}${mine}
        <span class="pr-status ${ciClass(pr.statusCheckRollup)}">${ciLabel(pr.statusCheckRollup)}</span>
        <span class="pr-status ${reviewClass(pr.reviewDecision)}">${reviewLabel(pr.reviewDecision)}</span>
      </span>
      <span class="pr-stats">
        <span>${timeAgo(pr.updatedAt)} ago</span>
        <span class="plus">+${Number(pr.additions || 0)}</span><span class="minus">-${Number(pr.deletions || 0)}</span>
      </span>
    </button>
  `;
}

function detailHTML(pr, state) {
  if (!pr) {
    if (state.prsLoading) {
      return `<div class="detail-empty">Loading open PRs…</div>`;
    }
    if (state.prsError) {
      return `
        <div class="detail-empty pr-empty">
          <div>
            <div class="big">Could not load PRs</div>
            <p>${escapeHTML(state.prsError)}</p>
          </div>
        </div>
      `;
    }
    const mineText = state.prFilterMine && state.prMe ? ` by @${state.prMe}` : "";
    return `
      <div class="detail-empty pr-empty">
        <div>
          <div class="big">No open PRs${escapeHTML(mineText)}</div>
          <p>${escapeHTML(repoLabel(state))} has no matching open pull requests.</p>
        </div>
      </div>
    `;
  }

  return `
    <div class="pr-detail-head">
      <div class="row1">
        <span class="pr-num big">#${pr.number}</span>
        ${pr.isDraft ? '<span class="pr-tag">draft</span>' : ""}
        ${pr.isMine ? '<span class="pr-tag mine">mine</span>' : ""}
        <span class="pr-status ${ciClass(pr.statusCheckRollup)}">${ciLabel(pr.statusCheckRollup)}</span>
        <span class="pr-status ${reviewClass(pr.reviewDecision)}">${reviewLabel(pr.reviewDecision)}</span>
      </div>
      <h1>${escapeHTML(pr.title)}</h1>
      <div class="meta">
        <span><b>Repo</b> ${escapeHTML(repoLabel(state))}</span>
        <span><b>Author</b> @${escapeHTML(pr.author || "unknown")}</span>
        <span><b>Updated</b> ${timeAgo(pr.updatedAt)} ago</span>
      </div>
      <div class="detail-actions">
        <button class="btn btn-primary" data-pr-action="open">Open PR</button>
        <button class="btn btn-secondary" data-pr-action="review">Copy review cmd</button>
        <button class="btn btn-ghost" data-pr-action="copy-url">Copy URL</button>
        <button class="btn btn-ghost" data-pr-action="copy-branch">Copy branch</button>
      </div>
    </div>
    <div class="pr-detail-body">
      <div class="pr-facts">
        <div><span>Branch</span><b>${escapeHTML(pr.headRefName)}</b></div>
        <div><span>Base</span><b>${escapeHTML(pr.baseRefName)}</b></div>
        <div><span>Files</span><b>${Number(pr.changedFiles || 0)}</b></div>
        <div><span>Diff</span><b><span class="plus">+${Number(pr.additions || 0)}</span> <span class="minus">-${Number(pr.deletions || 0)}</span></b></div>
        <div><span>Comments</span><b>${Number(pr.commentsCount || 0)}</b></div>
        <div><span>Reviews</span><b>${Number(pr.reviewsCount || 0)}</b></div>
      </div>
      ${state.prDetailsOpen ? `
        <div class="pr-url">
          <span>URL</span>
          <a href="${escapeHTML(pr.url)}" target="_blank" rel="noreferrer">${escapeHTML(pr.url)}</a>
        </div>
      ` : ""}
    </div>
  `;
}

export function updatePrCount(state) {
  const count = $("#count-prs");
  if (count) count.textContent = state.prsLoading ? "…" : String(state.prs.length);
}

export async function refreshPrs(state, opts = {}) {
  const render = opts.render;
  state.prsLoading = true;
  state.prsError = null;
  updatePrCount(state);
  if (render) render();
  try {
    const data = await apiGet(prEndpoint(state));
    state.prs = data.prs || [];
    state.prMe = data.me || "";
    state.prsRepo = data.repo || null;
    state.prsRepoRoot = data.repoRoot || null;
    const visible = visiblePrs(state);
    if (!visible.some((p) => p.number === state.selectedPrNumber)) {
      state.selectedPrNumber = visible[0]?.number ?? null;
    }
  } catch (e) {
    state.prs = [];
    state.prsError = e.hint ? `${e.message} — ${e.hint}` : e.message || "Could not load PRs.";
  } finally {
    state.prsLoading = false;
    updatePrCount(state);
    if (render) render();
  }
}

export function renderPrMode(state) {
  const listPane = $("#list-pane");
  const detailPane = $("#detail-pane");
  const list = visiblePrs(state);
  const pr = selectedPr(state);
  const mineCount = state.prs.filter((p) => p.isMine).length;
  const selectedLabel = repoLabel(state);

  listPane.classList.add("pr-list-pane");
  detailPane.classList.add("pr-detail-pane");
  listPane.innerHTML = `
    <div class="pr-panel-head">
      <div>
        <h2>Open PRs</h2>
        <p>${escapeHTML(selectedLabel)}${state.prMe ? ` · @${escapeHTML(state.prMe)}` : ""}</p>
      </div>
      <button class="btn sm btn-secondary" id="pr-refresh" ${state.prsLoading ? "disabled" : ""}>${state.prsLoading ? "Refreshing…" : "Refresh"}</button>
    </div>
    <div class="pr-filter">
      <button class="${state.prFilterMine ? "" : "active"}" data-pr-filter="all">All <span>${state.prs.length}</span></button>
      <button class="${state.prFilterMine ? "active" : ""}" data-pr-filter="mine">Mine <span>${mineCount}</span></button>
    </div>
    <div class="pr-rows">
      ${state.prsLoading && state.prs.length === 0 ? '<div class="pr-row-placeholder">Loading open pull requests…</div>' : ""}
      ${!state.prsLoading && state.prsError ? `<div class="pr-row-placeholder error">${escapeHTML(state.prsError)}</div>` : ""}
      ${!state.prsLoading && !state.prsError && list.length === 0 ? `<div class="pr-row-placeholder">No matching open PRs.</div>` : ""}
      ${list.map((p) => renderPrRow(p, p.number === pr?.number)).join("")}
    </div>
  `;
  detailPane.innerHTML = detailHTML(pr, state);

  $("#pr-refresh")?.addEventListener("click", () => refreshPrs(state, { render: () => renderPrMode(state) }));
  listPane.querySelectorAll("[data-pr-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.prFilterMine = btn.dataset.prFilter === "mine";
      const next = visiblePrs(state)[0];
      state.selectedPrNumber = next?.number ?? null;
      renderPrMode(state);
    });
  });
  listPane.querySelectorAll(".pr-row[data-pr-number]").forEach((row) => {
    row.addEventListener("click", () => {
      state.selectedPrNumber = Number(row.dataset.prNumber);
      renderPrMode(state);
    });
  });
  detailPane.querySelectorAll("[data-pr-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const current = selectedPr(state);
      if (!current) return;
      const action = btn.dataset.prAction;
      if (action === "open") window.open(current.url, "_blank");
      if (action === "copy-url") copyCmd(current.url);
      if (action === "copy-branch") copyCmd(current.headRefName);
      if (action === "review") copyCmd(`forge review ${current.number}`);
    });
  });
}

export function clearPrModeShell() {
  $("#list-pane").classList.remove("pr-list-pane");
  $("#detail-pane").classList.remove("pr-detail-pane");
}
