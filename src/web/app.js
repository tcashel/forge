"use strict";

import { apiGet, apiPost } from "./api.js";
import { copyCmd, runAction as runTaskAction } from "./actions.js";
import { $, $$, escapeHTML, showToast } from "./dom.js";
import { teardownLog } from "./log-stream.js";
import { renderMarkdown } from "./markdown.js";
import { CUSTOM_REPO_VALUE } from "./modal.js";
import { clearPrModeShell, refreshPrs, renderPrMode, updatePrCount } from "./prs.js";
import { repoChipHTML, statClass } from "./render.js";
import { repoKey, selectedRepoName, taskRepoKey } from "./repo-picker.js";
import { clearSettingsModeShell, refreshSettings, renderSettingsMode } from "./settings.js";
import { state } from "./state.js";

const runAction = (path, opts) => runTaskAction(path, opts, refreshTasks);

/* The Preact shell (src/web/components/App.tsx) renders the topbar,
   sidebar, repo picker, search, theme toggle, and clock. Phase 2 trimmed
   the corresponding wiring out of this file. The task list/detail
   panes are rendered into id-named slots that the Preact App seeds with
   the original markup once and then leaves alone. */

/* Snapshots of the inner markup of #list-pane / #detail-pane. PRs and
   Settings modes overwrite those panes wholesale; enterTaskMode restores
   them. The Preact <App /> component seeds the panes with the same
   markup on first render. */
const TASK_LIST_SHELL = `
  <header class="section-h" data-section="running">
    <span class="ic running"></span>
    <span class="name">Running now</span>
    <span class="count">0</span>
    <span class="help">Live — auto-refreshes every 3s</span>
  </header>
  <div id="list-running"></div>

  <header class="section-h" data-section="attention">
    <span class="ic attention"></span>
    <span class="name">Needs your attention</span>
    <span class="count">0</span>
    <span class="help">Failures + critique-ready</span>
  </header>
  <div id="list-attention"></div>

  <header class="section-h" data-section="ready">
    <span class="ic ready"></span>
    <span class="name">Ready to launch</span>
    <span class="count">0</span>
    <span class="help">Auto-improver has revised these</span>
  </header>
  <div id="list-ready"></div>

  <header class="section-h" data-section="drafting">
    <span class="ic drafting"></span>
    <span class="name">Drafting</span>
    <span class="count">0</span>
    <span class="help">First-pass specs — could use shape</span>
  </header>
  <div id="list-drafting"></div>

  <details class="done-section">
    <summary>
      <span class="chev">›</span>
      <span class="ic done" style="width:8px;height:8px;border-radius:50%;background:var(--done)"></span>
      <span>Recently done</span>
      <span class="count" style="margin-left:8px">0</span>
    </summary>
    <div id="list-done"></div>
  </details>
`;

const TASK_DETAIL_SHELL = `
  <div class="detail-empty" id="detail-empty">Select a task to see details.</div>
  <div class="detail-head" id="detail-head" hidden></div>
  <nav class="tabs" id="detail-tabs" hidden></nav>
  <div class="detail-body" id="detail-body" hidden></div>
`;

function selectedRepoLabel() {
  return selectedRepoName(state);
}

/* ─── pickup cards (derived from tasks) ────────────────────────────── */
function derivePickups(tasks) {
  const out = [];
  for (const t of tasks) {
    if (t.kind === "critique-ready") {
      out.push({
        kind: "attention", kindLabel: "Critique ready", when: `${t.age} ago`, repo: t.repo,
        title: t.title, blurb: t.blurb || "Critique finished — review before launching.",
        taskId: t.id, defaultTab: "critique",
      });
    }
  }
  for (const t of tasks) {
    if (t.kind === "failed") {
      out.push({
        kind: "failed", kindLabel: t.statLabel, when: `${t.age} ago`, repo: t.repo,
        title: t.title, blurb: t.error || t.blurb || "Run did not finish — open the log to inspect.",
        taskId: t.id, defaultTab: "log",
      });
    }
  }
  // Top-most running task (only when nothing higher-priority is waiting)
  const running = tasks.filter((t) => t.section === "running");
  if (out.length === 0 && running.length > 0) {
    const t = running[0];
    out.push({
      kind: "running", kindLabel: "Running now", when: `${t.age}`, repo: t.repo,
      title: t.title, blurb: t.agentLabel ? `${t.agentLabel}. Tail the log to follow.` : "Tail the log to follow.",
      taskId: t.id, defaultTab: "log",
    });
  }
  return out.slice(0, 4);
}

function renderPickup() {
  if (state.viewMode === "prs" || state.viewMode === "settings") {
    $("#pickup-section").style.display = "none";
    return;
  }
  const visible = visibleTasks();
  const picks = derivePickups(visible);
  const wrap = $("#pickup-cards");
  const sub = $("#pickup-sub");
  if (picks.length === 0) {
    $("#pickup-section").style.display = "none";
    sub.textContent = "Nothing waiting — clean slate.";
    return;
  }
  $("#pickup-section").style.display = "";
  const label = selectedRepoLabel();
  sub.textContent = picks.length === 1
    ? `1 thing waiting on you${label ? ` in ${label}` : ""}`
    : `${picks.length} things waiting on you${label ? ` in ${label}` : ""}`;
  wrap.innerHTML = picks.map((p) => `
    <div class="card ${p.kind}" data-task-id="${escapeHTML(p.taskId)}" data-tab="${escapeHTML(p.defaultTab)}">
      <div class="top">
        <span class="kind">● ${escapeHTML(p.kindLabel)}</span>
        ${repoChipHTML(p.repo)}
        <span class="when">${escapeHTML(p.when)}</span>
      </div>
      <div class="title">${escapeHTML(p.title)}</div>
      <div class="blurb">${escapeHTML(p.blurb)}</div>
    </div>
  `).join("");
  $$("#pickup-cards .card").forEach((card) => {
    card.addEventListener("click", () => {
      selectTask(card.dataset.taskId, card.dataset.tab);
    });
  });
}

/* ─── task list ────────────────────────────────────────────────────── */
function visibleTasks() {
  let list = state.selectedRepo ? state.tasks.filter((t) => taskRepoKey(t) === state.selectedRepo) : state.tasks.slice();
  const q = (state.searchQuery || "").toLowerCase().trim();
  if (q) {
    list = list.filter((t) => {
      const hay = [t.id, t.title, t.branch, t.repo, t.repoRoot, t.agentLabel || "", t.blurb || ""].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }
  return list;
}

function renderTaskRow(t) {
  const cls = statClass(t);
  const meta = [];
  if (!state.selectedRepo) meta.push(repoChipHTML(t.repo));
  if (t.repoStale) meta.push(`<span class="err">stale repo</span>`);
  if (t.agentLabel) meta.push(`<span class="agent">${escapeHTML(t.agentLabel)}</span>`);
  if (t.branch) meta.push(`<span>${escapeHTML(t.branch)}</span>`);
  if (t.age && t.age !== "—") meta.push(`<span>${escapeHTML(t.age)}${t.section === "running" ? " running" : " ago"}</span>`);
  if (t.kind === "critique-ready") meta.push(`<span class="crit-ready">● critique ready</span>`);
  if (t.error) meta.push(`<span class="err" title="${escapeHTML(t.error)}">${escapeHTML(t.error)}</span>`);

  return `<div class="task-row ${state.currentTaskId === t.id ? "selected" : ""}" data-id="${escapeHTML(t.id)}">
    <div class="left"><span class="stat-pill ${cls}">${escapeHTML(t.statLabel)}</span></div>
    <div class="task-main">
      <div class="title">${escapeHTML(t.title)}</div>
      <div class="meta">${meta.join('<span style="color:var(--rule-2)">·</span>')}</div>
    </div>
    <div class="right-action"></div>
  </div>`;
}

function renderLists() {
  if (state.viewMode === "prs") {
    renderPrMode(state);
    return;
  }
  if (state.viewMode === "settings") {
    renderSettingsMode(state);
    return;
  }
  const visible = visibleTasks();
  const map = { running: [], attention: [], ready: [], drafting: [], done: [] };
  for (const t of visible) { if (map[t.section]) map[t.section].push(t); }
  $("#list-running").innerHTML = map.running.map(renderTaskRow).join("");
  $("#list-attention").innerHTML = map.attention.map(renderTaskRow).join("");
  $("#list-ready").innerHTML = map.ready.map(renderTaskRow).join("");
  $("#list-drafting").innerHTML = map.drafting.map(renderTaskRow).join("");
  $("#list-done").innerHTML = map.done.map(renderTaskRow).join("");

  $$(".list-pane > .section-h").forEach((h) => {
    const k = h.dataset.section;
    const c = (map[k] || []).length;
    h.style.display = c === 0 ? "none" : "";
    const cnt = h.querySelector(".count");
    if (cnt) cnt.textContent = c;
  });
  const doneCount = $(".done-section summary .count");
  if (doneCount) doneCount.textContent = map.done.length;
  $(".done-section").style.display = map.done.length === 0 ? "none" : "";

  // empty state
  const pane = $("#list-pane");
  let empty = pane.querySelector(".empty-state");
  if (visible.length === 0) {
    if (!empty) {
      empty = document.createElement("div");
      empty.className = "empty-state";
      empty.style.cssText = "padding:32px 12px;color:var(--dim);font-size:13px;text-align:center";
      pane.appendChild(empty);
    }
    if (state.searchQuery) {
      empty.innerHTML = `No tasks match <b style="color:var(--text-2)">"${escapeHTML(state.searchQuery)}"</b>. <button id="empty-clear-search" style="margin-left:6px;color:var(--primary);background:transparent;border:0;cursor:pointer;font:inherit">Clear search</button>`;
      // Wire after innerHTML — runs once per empty render.
      const clearBtn = empty.querySelector("#empty-clear-search");
      if (clearBtn) clearBtn.addEventListener("click", () => {
        $("#search-input").value = "";
        state.searchQuery = "";
        applyFilter();
      });
    } else {
      empty.innerHTML = state.selectedRepo
        ? `No tasks in <b style="color:var(--text-2)">${escapeHTML(selectedRepoLabel() || state.selectedRepo)}</b>. Save a spec from a shell:<br><code style="display:inline-block;margin-top:8px;color:var(--text-2);background:var(--panel-2);padding:4px 8px;border-radius:4px">cat plan.md | forge spec save -</code>`
        : `No tasks yet. Click <b style="color:var(--text-2)">+ New spec</b> in the sidebar (or <code style="background:var(--panel-2);padding:2px 6px;border-radius:4px">cat plan.md | forge spec save -</code> from a shell).`;
    }
  } else if (empty) {
    empty.remove();
  }

  // sidebar nav counts
  $("#count-pickup").textContent = derivePickups(visible).length;
  $("#count-running").textContent = map.running.length;
  $("#count-backlog").textContent = map.ready.length + map.drafting.length;
  $("#count-done").textContent = map.done.length;
}

/* ─── detail pane ──────────────────────────────────────────────────── */
function selectTask(id, tab) {
  const t = state.tasks.find((x) => x.id === id);
  if (!t) return;
  state.currentTaskId = id;

  if (!tab) {
    if (t.section === "running") tab = "log";
    else if (t.kind === "critique-ready") tab = "critique";
    else tab = "spec";
  }
  state.currentTab = tab;

  $("#detail-empty").hidden = true;
  $("#detail-head").hidden = false;
  $("#detail-tabs").hidden = false;
  $("#detail-body").hidden = false;

  $$(".task-row").forEach((r) => r.classList.toggle("selected", r.dataset.id === id));

  state.lastDetailFp = detailFingerprint(t);
  renderDetailHead(t);
  renderTabs(t);
  renderTabPane(t);
}

function renderDetailHead(t) {
  const head = $("#detail-head");
  const meta = [];
  if (t.agentLabel) meta.push(`<span><b>Agent</b> ${escapeHTML(t.agentLabel)}</span>`);
  if (t.branch) meta.push(`<span><b>Branch</b> <span class="branch">${escapeHTML(t.branch)}</span></span>`);
  if (t.age && t.age !== "—") meta.push(`<span><b>Age</b> ${escapeHTML(t.age)}</span>`);
  if (t.prNumber) meta.push(`<span><b>PR</b> ${t.prUrl ? `<a href="${escapeHTML(t.prUrl)}" target="_blank" style="color:var(--primary)">#${t.prNumber}</a>` : `#${t.prNumber}`}</span>`);
  if (!state.selectedRepo) meta.push(`<span><b>Repo</b> ${escapeHTML(t.repo)}</span>`);

  head.innerHTML = `
    <div class="row1">
      <span class="stat-pill ${statClass(t)}">${escapeHTML(t.statLabel)}</span>
      ${t.kind === "critique-ready" ? '<span style="color:var(--attention);font-size:11.5px;font-weight:600">● critique waiting</span>' : ""}
      ${t.tmuxAlive ? '<span style="color:var(--running);font-size:11.5px;font-weight:600">● tmux alive</span>' : ""}
    </div>
    <h1>${escapeHTML(t.title)}</h1>
    <div class="meta">${meta.join("")}</div>
    <div class="detail-actions">
      ${actionsForHTML(t)}
    </div>
  `;
}

/* Action HTML uses data-action="..." instead of binding a closure per
   button. A single delegated click handler on #detail-head dispatches
   to ACTION_DISPATCH, looking up the *current* task by state.currentTaskId
   on each click. This eliminates the previous setTimeout-vs-poll race
   where button handlers could attach to nodes that were about to be
   replaced by the next render. */
const ACTION_DISPATCH = {
  "tail-log": () => switchTab("log"),
  "open-log": () => switchTab("log"),
  "view-spec": () => switchTab("spec"),
  "review-critique": () => switchTab("critique"),
  "copy-attach": (t) => copyCmd(`forge attach ${t.id}`),
  "open-pr": (t) => { if (t.prUrl) window.open(t.prUrl, "_blank"); },
  "launch": (t) => runAction(`/api/tasks/${encodeURIComponent(t.id)}/launch`, { successMsg: `Launching ${t.id}…` }),
  "critique": (t) => runAction(`/api/tasks/${encodeURIComponent(t.id)}/critique`, { successMsg: `Critique queued for ${t.id}` }),
  "kill": (t) => runAction(`/api/tasks/${encodeURIComponent(t.id)}/kill`, {
    successMsg: `Killed ${t.id}`,
    confirm: `Kill this run?\n\nThe tmux session will be terminated and the task marked failed.`,
  }),
};

function actionsForHTML(t) {
  const items = [];
  if (t.section === "running") {
    items.push({ label: "Tail log", cls: "btn-primary", action: "tail-log" });
    // Attach has to stay copy-only — terminal control can't transfer from the browser.
    if (t.tmuxAlive) items.push({ label: "Attach tmux", cls: "btn-secondary", action: "copy-attach" });
    if (t.prUrl) items.push({ label: "Open PR draft", cls: "btn-ghost", action: "open-pr" });
    items.push({ label: "Kill", cls: "btn-ghost", action: "kill" });
  } else if (t.kind === "critique-ready") {
    items.push({ label: "Review critique", cls: "btn-attention", action: "review-critique" });
    items.push({ label: "Launch anyway", cls: "btn-secondary", action: "launch" });
  } else if (t.kind === "failed") {
    items.push({ label: "Open log", cls: "btn-primary", action: "open-log" });
    items.push({ label: "View spec", cls: "btn-secondary", action: "view-spec" });
    items.push({ label: "Re-launch", cls: "btn-ghost", action: "launch" });
  } else if (t.section === "ready") {
    items.push({ label: "Launch", cls: "btn-primary", action: "launch" });
    items.push({ label: "Critique", cls: "btn-secondary", action: "critique" });
    items.push({ label: "View spec", cls: "btn-ghost", action: "view-spec" });
  } else if (t.section === "drafting") {
    items.push({ label: "View spec", cls: "btn-primary", action: "view-spec" });
    items.push({ label: "Run critique", cls: "btn-secondary", action: "critique" });
    items.push({ label: "Launch", cls: "btn-ghost", action: "launch" });
  } else if (t.section === "done") {
    if (t.prUrl) items.push({ label: "Open PR", cls: "btn-primary", action: "open-pr" });
    items.push({ label: "View spec", cls: "btn-secondary", action: "view-spec" });
  }
  return items.map((a) =>
    `<button class="btn ${a.cls}" data-action="${a.action}">${escapeHTML(a.label)}</button>`
  ).join("");
}

function switchTab(id) {
  state.currentTab = id;
  const t = state.tasks.find((x) => x.id === state.currentTaskId);
  if (!t) return;
  renderTabs(t);
  renderTabPane(t);
}

function renderTabs(t) {
  const isRun = t.section === "running";
  const tabs = [
    { id: "log", label: "Live log", enabled: isRun || t.kind === "failed" || t.section === "done", badge: isRun ? '<span class="dot live"></span>' : "" },
    { id: "spec", label: "Spec", enabled: t.hasSpec },
    { id: "plan", label: "Plan chat", enabled: true, badge: '<span class="pill">soon</span>' },
    { id: "critique", label: "Critique", enabled: !!t.critique, badge: t.kind === "critique-ready" ? '<span class="dot alert"></span>' : "" },
    { id: "gates", label: "Quality gates", enabled: isRun || t.kind === "failed" || t.section === "done" },
  ];
  $("#detail-tabs").innerHTML = tabs.map((tb) => `
    <button class="tab ${state.currentTab === tb.id ? "active" : ""}" data-tab="${tb.id}" ${tb.enabled ? "" : `disabled style="opacity:0.4;cursor:not-allowed"`}>
      ${tb.badge || ""} ${escapeHTML(tb.label)}
    </button>
  `).join("");
  $$("#detail-tabs .tab").forEach((b) => b.addEventListener("click", () => {
    if (b.disabled) return;
    switchTab(b.dataset.tab);
  }));
}

function renderTabPane(t) {
  teardownLog();
  const body = $("#detail-body");
  if (state.currentTab === "log") return renderLogTab(t, body);
  if (state.currentTab === "spec") return renderSpecTab(t, body);
  if (state.currentTab === "plan") return renderPlanTab(t, body);
  if (state.currentTab === "critique") return renderCritiqueTab(t, body);
  if (state.currentTab === "gates") return renderGatesTab(t, body);
}

/* ─── log tab (SSE) ────────────────────────────────────────────────── */
function classifyLogLine(line) {
  if (/✗|✘|FAIL|error|fatal|exit 1|\bERR\b/i.test(line)) return "err";
  if (/✓|✔|PASS|✅|\bOK\b|done\./i.test(line)) return "ok";
  if (/⚠|warn(ing)?\b/i.test(line)) return "warn";
  if (/^\$\s/.test(line) || /^>>>/.test(line) || /^═/.test(line)) return "info";
  return "dim";
}

function appendLogLines(box, text) {
  if (!text) return;
  const wasAtBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 60;
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    if (line === "" && box.lastElementChild && box.lastElementChild.textContent === "") continue;
    const div = document.createElement("div");
    div.className = `line ${classifyLogLine(line)}`;
    div.textContent = line;
    box.appendChild(div);
  }
  // cap at 5000 lines so very long runs don't OOM the tab
  while (box.children.length > 5000) box.removeChild(box.firstChild);
  if (wasAtBottom) box.scrollTop = box.scrollHeight;
}

function renderLogTab(t, body) {
  const isLive = t.section === "running";
  body.innerHTML = `
    <div class="log-toolbar">
      <span class="toggle ${isLive ? "on" : ""}"><span class="d"></span> ${isLive ? "Following live" : "Static (run finished)"}</span>
      <button class="btn sm btn-ghost" id="log-copy-path">Copy log path</button>
      <span style="margin-left:auto" class="mono">~/.forge/runs/${escapeHTML(t.id)}/agent.log</span>
    </div>
    <div class="log" id="logbox"></div>
  `;
  $("#log-copy-path").addEventListener("click", () => copyCmd(`~/.forge/runs/${t.id}/agent.log`));
  const box = $("#logbox");

  if (!t.hasLog) {
    box.innerHTML = `<div class="line dim">No log file yet — run hasn't started, or it was deleted.</div>`;
    return;
  }

  const url = `/api/tasks/${encodeURIComponent(t.id)}/log?lines=400`;
  const src = new EventSource(url);
  state.logSource = src;
  src.addEventListener("snapshot", (e) => appendLogLines(box, e.data));
  src.addEventListener("append", (e) => appendLogLines(box, e.data));
  src.addEventListener("error", () => {
    appendLogLines(box, "(log stream disconnected)");
    teardownLog();
    // Inject a Reconnect button next to the toolbar so the user can
    // recover without switching tabs and back.
    const tb = body.querySelector(".log-toolbar");
    if (tb && !tb.querySelector("#log-reconnect")) {
      const btn = document.createElement("button");
      btn.id = "log-reconnect";
      btn.className = "btn sm btn-secondary";
      btn.textContent = "Reconnect";
      btn.style.marginLeft = "8px";
      btn.addEventListener("click", () => renderLogTab(t, body));
      tb.insertBefore(btn, tb.querySelector("[style*='margin-left:auto']") || null);
    }
  });
}

/* ─── spec tab ─────────────────────────────────────────────────────── */
async function renderSpecTab(t, body) {
  body.innerHTML = `<div class="spec" id="spec-out"><p style="color:var(--dim)">Loading spec…</p></div>`;
  try {
    const data = await apiGet(`/api/tasks/${encodeURIComponent(t.id)}/spec?raw=1`);
    $("#spec-out").innerHTML = renderMarkdown(data.body || "");
  } catch (e) {
    $("#spec-out").innerHTML = `<p style="color:var(--failed)">Could not load spec: ${escapeHTML(e.message)}</p>`;
  }
}

/* ─── plan chat tab (placeholder for PR 3) ─────────────────────────── */
function renderPlanTab(t, body) {
  body.innerHTML = `
    <div class="empty-pane">
      <div class="big">Planner chat lives in Claude Code today</div>
      <p>Open Claude Code, run plan-mode for "${escapeHTML(t.title)}", then <code>/forge-ship-plan</code> to save.</p>
      <p style="margin-bottom:8px">Browser-native planner is on the roadmap (see PR&nbsp;3 of the workbench rollout).</p>
      <button class="btn btn-secondary" id="plan-copy-id">Copy task id</button>
    </div>
  `;
  $("#plan-copy-id").addEventListener("click", () => copyCmd(t.id));
}

/* ─── critique tab ─────────────────────────────────────────────────── */
async function renderCritiqueTab(t, body) {
  body.innerHTML = `<p style="color:var(--dim)">Loading critique…</p>`;
  try {
    const data = await apiGet(`/api/tasks/${encodeURIComponent(t.id)}/critique`);
    if (!data.critique) {
      body.innerHTML = `
        <div class="empty-pane">
          <div class="big">No critique on file</div>
          <p>Run a two-critic + synthesizer pass before launching:</p>
          <button class="btn btn-primary" id="crit-run">Run critique</button>
        </div>
      `;
      $("#crit-run").addEventListener("click", () => runAction(`/api/tasks/${encodeURIComponent(t.id)}/critique`, {
        successMsg: `Critique queued for ${t.id}`,
      }));
      return;
    }
    const c = data.critique;
    const m = c.meta;
    body.innerHTML = `
      <div style="display:flex; gap:10px; align-items:center; margin-bottom:14px; flex-wrap:wrap">
        <span style="font-size:13px;color:var(--text)"><b>Critique status:</b></span>
        <span style="color:var(--ready);font-size:13px">${escapeHTML(m.status)}</span>
        <span style="margin-left:auto;font-size:11px;color:var(--dim)">${escapeHTML(m.startedAt || "")}</span>
      </div>
      <div class="critique-grid">
        ${critiqueCardHTML("Critic A", m.criticA, c.criticA)}
        ${critiqueCardHTML("Critic B", m.criticB, c.criticB)}
        ${critiqueCardHTML("Synthesizer", m.synthesizer, c.synth || c.recommendations)}
      </div>
      ${c.recommendations ? `
        <h3 style="font-size:13px;color:var(--text);margin:18px 0 6px">Recommendations</h3>
        <div class="spec" style="max-width:none">${renderMarkdown(c.recommendations)}</div>
      ` : ""}
    `;
  } catch (e) {
    body.innerHTML = `<p style="color:var(--failed)">Could not load critique: ${escapeHTML(e.message)}</p>`;
  }
}

function critiqueCardHTML(role, agentMeta, content) {
  const agentLabel = agentMeta ? `${agentMeta.agent} · ${agentMeta.model}` : "—";
  const status = agentMeta ? agentMeta.status : "—";
  return `<div class="critique-card">
    <div class="role">${escapeHTML(role)}</div>
    <div class="agent">${escapeHTML(agentLabel)}</div>
    <div class="verdict">${escapeHTML(status)}</div>
    <div class="summary">${content ? escapeHTML(content).slice(0, 1200) : '<span style="color:var(--dim)">No output yet</span>'}</div>
  </div>`;
}

/* ─── gates tab ────────────────────────────────────────────────────── */
async function renderGatesTab(t, body) {
  try {
    const data = await apiGet(`/api/tasks/${encodeURIComponent(t.id)}`);
    const meta = data.meta || {};
    const results = meta.qualityResults || [];
    if (results.length === 0) {
      body.innerHTML = `<div class="empty-pane"><div class="big">No quality run yet</div><p>Quality gates run automatically after the agent commits its work.</p></div>`;
      return;
    }
    const passCount = results.filter((r) => r.ok).length;
    const summary = passCount === results.length
      ? "All passed"
      : `${passCount} of ${results.length} passed`;
    body.innerHTML = `
      <div class="gates">
        <div class="gh">
          Quality gates
          <span class="summary">${escapeHTML(summary)}</span>
        </div>
        <table>${results.map((r) => `<tr>
          <td class="cmd">${escapeHTML(r.command)}</td>
          <td class="stat"><span class="pill ${r.ok ? "pass" : "fail"}">${r.ok ? "PASS" : "FAIL"}</span></td>
          <td class="dur">${escapeHTML(formatDur(r.durationMs))}</td>
        </tr>`).join("")}</table>
      </div>
    `;
  } catch (e) {
    body.innerHTML = `<p style="color:var(--failed)">Could not load gates: ${escapeHTML(e.message)}</p>`;
  }
}

function formatDur(ms) {
  if (typeof ms !== "number") return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/* ─── filtering ────────────────────────────────────────────────────── */
function applyFilter() {
  document.body.classList.toggle("filtered-single", !!state.selectedRepo);
  if (state.viewMode === "prs" || state.viewMode === "settings") {
    renderLists();
    return;
  }
  renderPickup();
  renderLists();
  // If the currently selected task vanished entirely (was deleted from the
  // index by some other process), clear. Otherwise: when the repo filter
  // hides it, switch to the first visible task. When SEARCH hides it,
  // leave the detail visible — yanking it mid-typing is disorienting.
  if (state.currentTaskId) {
    const t = state.tasks.find((x) => x.id === state.currentTaskId);
    const hiddenByRepo = t && state.selectedRepo && taskRepoKey(t) !== state.selectedRepo;
    if (!t) {
      clearDetail();
    } else if (hiddenByRepo) {
      const first = visibleTasks()[0];
      if (first) selectTask(first.id);
      else clearDetail();
    } else {
      // Skip the re-render when nothing observable changed. Without this
      // the 3s poll repaints the entire detail head every tick — flicker
      // + lost focus + lost button state.
      const fp = detailFingerprint(t);
      if (fp !== state.lastDetailFp) {
        state.lastDetailFp = fp;
        renderDetailHead(t);
        renderTabs(t);
      }
    }
  }
}

/* Fingerprint of every detail-head/tabs-relevant field. If unchanged we skip the re-render. */
function detailFingerprint(t) {
  return [
    t.id, t.status, t.statLabel, t.statClass, t.kind || "",
    t.branch || "", t.agentLabel || "", t.prUrl || "", t.prNumber || "",
    t.tmuxAlive ? "1" : "0", t.age || "", t.error || "",
    t.hasLog ? "1" : "0", t.hasSpec ? "1" : "0",
    t.critique ? `${t.critique.id}:${t.critique.status}:${t.critique.viewedAt || ""}` : "",
  ].join("|");
}

function clearDetail() {
  state.currentTaskId = null;
  teardownLog();
  $("#detail-empty").hidden = false;
  $("#detail-head").hidden = true;
  $("#detail-tabs").hidden = true;
  $("#detail-body").hidden = true;
}

function enterTaskMode(target = "all") {
  state.viewMode = "tasks";
  $("#mobile-work-btn")?.classList.add("active");
  $("#mobile-prs-btn")?.classList.remove("active");
  clearPrModeShell();
  clearSettingsModeShell();
  if (!$("#list-pane").querySelector(".section-h")) $("#list-pane").innerHTML = TASK_LIST_SHELL;
  if (!$("#detail-empty")) $("#detail-pane").innerHTML = TASK_DETAIL_SHELL;
  applyFilter();
  if (target === "all") {
    $("#list-pane").scrollTo({ top: 0, behavior: "smooth" });
  } else {
    const header = $("#list-pane").querySelector(`.section-h[data-section="${target}"]`);
    if (header) header.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

async function enterPrMode() {
  state.viewMode = "prs";
  $("#mobile-prs-btn")?.classList.add("active");
  $("#mobile-work-btn")?.classList.remove("active");
  $("#pickup-section").style.display = "none";
  teardownLog();
  clearSettingsModeShell();
  clearDetail();
  renderPrMode(state);
  await refreshPrs(state, { render: () => renderPrMode(state) });
}

async function enterSettingsMode() {
  state.viewMode = "settings";
  $("#mobile-work-btn")?.classList.remove("active");
  $("#mobile-prs-btn")?.classList.remove("active");
  $("#pickup-section").style.display = "none";
  teardownLog();
  clearPrModeShell();
  clearDetail();
  renderSettingsMode(state);
  await refreshSettings(state, { render: () => renderSettingsMode(state) });
}

/* ─── data fetch ───────────────────────────────────────────────────── */
async function refreshContext() {
  try {
    state.context = await apiGet("/api/workbench/context");
  } catch {
    state.context = null;
  }
}

async function refreshTasks() {
  try {
    const data = await apiGet("/api/tasks");
    state.tasks = data.tasks || [];
    $("#refresh-dot").classList.remove("stale");
    $("#foot-refreshed").textContent = new Date().toLocaleTimeString();
    applyFilter();
  } catch (e) {
    $("#refresh-dot").classList.add("stale");
    showToast(`Refresh failed: ${e.message}`, "error");
  }
}

async function refreshRepos() {
  try {
    const data = await apiGet("/api/repos");
    state.repos = data.repos || [];
    if (state.selectedRepo && !state.repos.some((r) => repoKey(r) === state.selectedRepo)) {
      state.selectedRepo = "";
    }
  } catch {
    state.repos = [];
  }
}

async function refreshPrCount() {
  try {
    const data = await apiGet("/api/prs" + (state.selectedRepo ? `?repo=${encodeURIComponent(state.selectedRepo)}` : ""));
    state.prs = data.prs || [];
    state.prMe = data.me || "";
    state.prsRepo = data.repo || null;
    state.prsRepoRoot = data.repoRoot || null;
    state.prsError = null;
    updatePrCount(state);
    if (state.viewMode === "prs") renderPrMode(state);
  } catch {
    state.prsError = "Could not refresh PR count.";
    $("#count-prs").textContent = "—";
  }
}

/* ─── boot ─────────────────────────────────────────────────────────── */
async function boot() {
  await refreshContext();
  await refreshRepos();
  if (!state.selectedRepo && state.context?.currentRepo) {
    const currentRoot = state.context.currentRepo.root;
    if (state.repos.some((r) => repoKey(r) === currentRoot)) state.selectedRepo = currentRoot;
  }
  await refreshTasks();
  refreshPrCount();
  // 3s polling for tasks, slower for repos and PRs
  state.refreshTimer = setInterval(refreshTasks, 3000);
  setInterval(refreshRepos, 30_000);
  setInterval(refreshPrCount, 30_000);
  // Default selection: pick the first task that needs attention (a critique-
  // ready or failed kind), then any running task, then anything else. The
  // section field is "running" | "ready" | "drafting" | "done" | "attention",
  // but only critique-ready/failed *kinds* roll up into the attention section,
  // so use kind for those and section for the rest.
  const visible = visibleTasks();
  const candidates = [
    visible.find((t) => t.kind === "critique-ready" || t.kind === "failed"),
    visible.find((t) => t.section === "running"),
    visible[0],
  ].filter(Boolean);
  if (candidates[0]) selectTask(candidates[0].id);
}

/* ─── new spec modal ──────────────────────────────────────────────── */

function openNewSpecModal() {
  const modal = $("#new-spec-modal");
  const repoSel = $("#new-spec-repo");
  const known = state.repos.filter((r) => !r.stale).map((r) =>
    `<option value="${escapeHTML(r.root)}">${escapeHTML(r.name)} (${escapeHTML(r.root)})</option>`
  ).join("");
  // Always include a Custom path option so first-time users (no known
  // repos) and users who want a brand-new repo aren't blocked.
  repoSel.innerHTML = `${known}<option value="${CUSTOM_REPO_VALUE}">Custom path…</option>`;
  $("#new-spec-submit").disabled = false;
  // Default selection: currently-selected repo, else first known, else custom.
  const selected = state.repos.find((r) => repoKey(r) === state.selectedRepo && !r.stale);
  if (selected) repoSel.value = selected.root;
  else if (state.repos[0]) repoSel.value = state.repos[0].root;
  else repoSel.value = CUSTOM_REPO_VALUE;
  toggleRepoCustomField();
  modal.hidden = false;
  // Focus the body unless they're starting from custom-path (then focus that).
  setTimeout(() => {
    if (repoSel.value === CUSTOM_REPO_VALUE) $("#new-spec-repo-custom").focus();
    else $("#new-spec-body").focus();
  }, 0);
}

function toggleRepoCustomField() {
  const isCustom = $("#new-spec-repo").value === CUSTOM_REPO_VALUE;
  $("#new-spec-repo-custom-wrap").hidden = !isCustom;
  if (isCustom) $("#new-spec-repo-custom").focus();
}

function closeNewSpecModal() {
  const modal = $("#new-spec-modal");
  modal.hidden = true;
  $("#new-spec-form").reset();
  $("#new-spec-submit").disabled = false;
  $("#new-spec-submit").textContent = "Save spec";
}

$("#new-spec-close").addEventListener("click", closeNewSpecModal);
$("#new-spec-cancel").addEventListener("click", closeNewSpecModal);
$("#new-spec-modal").addEventListener("click", (e) => {
  if (e.target.id === "new-spec-modal") closeNewSpecModal();
});
$("#new-spec-repo").addEventListener("change", toggleRepoCustomField);

$("#list-pane").addEventListener("click", (e) => {
  const row = e.target.closest(".task-row[data-id]");
  if (!row) return;
  selectTask(row.dataset.id);
});

/* Modal focus trap: Tab inside the modal cycles between its focusables. */
$("#new-spec-modal").addEventListener("keydown", (e) => {
  if (e.key !== "Tab") return;
  const card = $("#new-spec-modal .modal-card");
  const focusable = card.querySelectorAll(
    'button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (focusable.length === 0) return;
  const visible = Array.from(focusable).filter((el) => !el.disabled && el.offsetParent !== null);
  if (visible.length === 0) return;
  const first = visible[0];
  const last = visible[visible.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

$("#new-spec-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  let repoRoot = $("#new-spec-repo").value.trim();
  if (repoRoot === CUSTOM_REPO_VALUE) {
    repoRoot = $("#new-spec-repo-custom").value.trim();
  }
  const markdown = $("#new-spec-body").value;
  const title = $("#new-spec-title").value.trim();
  const agent = $("#new-spec-agent").value;
  const model = $("#new-spec-model").value.trim();
  const autoImprove = $("#new-spec-improve").checked;

  if (!repoRoot) { showToast("Pick a repo or enter a custom path.", "error"); return; }
  if (!markdown.trim()) { showToast("Markdown body is required.", "error"); return; }

  const submit = $("#new-spec-submit");
  submit.disabled = true;
  submit.textContent = "Saving…";

  // Always do a *fast* save (autoImprove=false). If the user wants
  // auto-improve, fire it as a separate background request — the server
  // detaches it to a subprocess and returns immediately, so the new task
  // shows up in the list right away with an "Improving" pulse pill.
  const body = {
    markdown,
    repoRoot,
    autoImprove: false,
    ...(title ? { title } : {}),
    ...(agent ? { agent } : {}),
    ...(model ? { model } : {}),
  };

  try {
    const data = await apiPost("/api/specs", body);
    closeNewSpecModal();
    await refreshTasks();
    if (data.taskId) selectTask(data.taskId);

    if (autoImprove && data.taskId) {
      showToast(`Saved ${data.taskId} — auto-improve running in background…`, "info");
      // Fire-and-forget. The server returns { queued: true } immediately;
      // the next 3s task poll surfaces the "Improving" pill, then "Ready".
      apiPost(`/api/tasks/${encodeURIComponent(data.taskId)}/improve`, {}).catch((err) => {
        showToast(err.hint ? `Auto-improve failed: ${err.message} — ${err.hint}` : `Auto-improve failed: ${err.message}`, "error");
      });
    } else {
      showToast(`Saved spec ${data.taskId}`, "info");
    }
  } catch (err) {
    const msg = err.hint ? `${err.message} — ${err.hint}` : (err.message || "Save failed");
    showToast(msg, "error");
    submit.disabled = false;
    submit.textContent = "Save spec";
  }
});

/* Delegated handler for detail-head action buttons (see actionsForHTML). */
$("#detail-pane").addEventListener("click", async (e) => {
  const btn = e.target.closest("button.btn[data-action]");
  if (!btn || btn.disabled) return;
  const action = btn.dataset.action;
  const handler = ACTION_DISPATCH[action];
  if (!handler) return;
  const t = state.tasks.find((x) => x.id === state.currentTaskId);
  if (!t) return;
  const result = handler(t);
  if (result && typeof result.then === "function") {
    btn.disabled = true;
    const original = btn.textContent;
    btn.textContent = "Working…";
    try { await result; } finally {
      btn.disabled = false;
      btn.textContent = original;
    }
  }
});

/* Modal-only keyboard handler. Search-bar focus, '/' / ⌘K, 'r' (repo
   popover), and Escape-clears-search are owned by Preact components in
   <Search /> and <RepoPicker />. We only need: Escape closes the
   currently-open new-spec modal, and 'n' opens it. */
window.addEventListener("keydown", (e) => {
  if (!$("#new-spec-modal").hidden) {
    if (e.key === "Escape") { e.preventDefault(); closeNewSpecModal(); }
    return;
  }
  if (e.target.matches("input,textarea,select")) return;
  if (e.key === "n" && !e.metaKey && !e.ctrlKey) { e.preventDefault(); openNewSpecModal(); }
});

window.addEventListener("beforeunload", () => {
  teardownLog();
  if (state.refreshTimer) clearInterval(state.refreshTimer);
});

/* ─── Preact ↔ legacy bridge ──────────────────────────────────────── */

/* Register legacy callbacks that the Preact shell (sidebar, repo picker,
   topbar, search) dispatches into. main.tsx publishes the signal bag
   first, so window.__forge is already populated by the time this script
   runs. */
function setSelectedRepoFromBridge(key) {
  state.selectedRepo = key || "";
  applyFilter();
  if (state.viewMode === "prs") refreshPrs(state, { render: () => renderPrMode(state) });
  if (state.viewMode === "settings") refreshSettings(state, { render: () => renderSettingsMode(state) });
}

if (window.__forge) {
  Object.assign(window.__forge.legacy, {
    setSelectedRepo: setSelectedRepoFromBridge,
    applyFilter,
    refreshRepos,
    showToast,
    enterTaskMode,
    enterPrMode,
    enterSettingsMode,
    openNewSpecModal,
  });

  /* When Preact-owned signals (search, selectedRepo) change, re-run the
     legacy filter pipeline. The signals fire synchronously on .value =
     ... so this glues Preact-side input edits to the legacy task list
     re-render without coupling app.js to Preact. */
  let firstRun = true;
  window.__forge.effect(() => {
    // Read every signal we want to subscribe to.
    void window.__forge.signals.searchQuery.value;
    void window.__forge.signals.selectedRepo.value;
    if (firstRun) { firstRun = false; return; }
    applyFilter();
  });
}

boot();
