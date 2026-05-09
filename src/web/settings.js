"use strict";

import { apiGet, apiPost } from "./api.js";
import { $, escapeHTML, showToast } from "./dom.js";
import { selectedRepoName } from "./repo-picker.js";

const AGENTS = ["", "claude", "codex", "opencode", "gemini"];
const EFFORTS = ["", "low", "medium", "high", "xhigh"];

function settingsEndpoint(state) {
  return `/api/config${state.selectedRepo ? `?repo=${encodeURIComponent(state.selectedRepo)}` : ""}`;
}

function optionHTML(values, selected, emptyLabel) {
  return values.map((value) => {
    const label = value || emptyLabel;
    return `<option value="${escapeHTML(value)}" ${String(selected || "") === value ? "selected" : ""}>${escapeHTML(label)}</option>`;
  }).join("");
}

function textField(key, label, cfg, placeholder = "") {
  return `
    <label class="settings-field">
      <span>${escapeHTML(label)}</span>
      <input data-setting="${escapeHTML(key)}" value="${escapeHTML(cfg[key] ?? "")}" placeholder="${escapeHTML(placeholder)}">
    </label>
  `;
}

function selectField(key, label, cfg, values, emptyLabel) {
  return `
    <label class="settings-field">
      <span>${escapeHTML(label)}</span>
      <select data-setting="${escapeHTML(key)}">${optionHTML(values, cfg[key], emptyLabel)}</select>
    </label>
  `;
}

function boolField(key, label, cfg, defaultLabel) {
  const value = cfg[key];
  const defaultChecked = defaultLabel === "on";
  const checked = value === undefined ? defaultChecked : value === true;
  return `
    <label class="settings-check">
      <input data-setting="${escapeHTML(key)}" data-default-checked="${defaultChecked ? "1" : "0"}" type="checkbox" ${value === undefined ? "data-defaulted=\"1\"" : ""} ${checked ? "checked" : ""}>
      <span>${escapeHTML(label)}</span>
      <small>${value === undefined ? `default ${defaultLabel}` : "repo override"}</small>
    </label>
  `;
}

function repoLabel(state) {
  return state.settingsRepo?.name || selectedRepoName(state) || "Current repo";
}

function readPatch(form) {
  const patch = {};
  form.querySelectorAll("[data-setting]").forEach((el) => {
    const key = el.dataset.setting;
    if (el.type === "checkbox") {
      const inherited = el.dataset.defaulted === "1";
      const defaultChecked = el.dataset.defaultChecked === "1";
      patch[key] = inherited && el.checked === defaultChecked ? null : el.checked;
    } else if (key === "autoFixRounds") {
      const raw = el.value.trim();
      patch[key] = raw ? Number(raw) : null;
    } else {
      patch[key] = el.value.trim() || null;
    }
  });
  return patch;
}

export async function refreshSettings(state, opts = {}) {
  const render = opts.render;
  state.settingsLoading = true;
  state.settingsError = null;
  if (render) renderSettingsMode(state);
  try {
    const data = await apiGet(settingsEndpoint(state));
    state.settingsRepo = data.repo || null;
    state.settingsConfig = data.config || {};
  } catch (e) {
    state.settingsRepo = null;
    state.settingsConfig = {};
    state.settingsError = e.hint ? `${e.message} — ${e.hint}` : e.message || "Could not load settings.";
  } finally {
    state.settingsLoading = false;
    if (render) renderSettingsMode(state);
  }
}

export function renderSettingsMode(state) {
  const listPane = $("#list-pane");
  const detailPane = $("#detail-pane");
  const cfg = state.settingsConfig || {};
  listPane.classList.add("settings-list-pane");
  detailPane.classList.add("settings-detail-pane");
  listPane.innerHTML = `
    <div class="settings-nav-head">
      <h2>Settings</h2>
      <p>${escapeHTML(repoLabel(state))}</p>
    </div>
    <div class="settings-nav-card">
      <b>Repo config</b>
      <span>${escapeHTML(state.settingsRepo?.root || "No repo selected")}</span>
    </div>
    <div class="settings-nav-card">
      <b>Stored in</b>
      <span>~/.forge/repo-config.json</span>
    </div>
  `;
  if (state.settingsLoading) {
    detailPane.innerHTML = `<div class="detail-empty">Loading settings…</div>`;
    return;
  }
  if (state.settingsError) {
    detailPane.innerHTML = `<div class="detail-empty pr-empty"><div><div class="big">Settings unavailable</div><p>${escapeHTML(state.settingsError)}</p></div></div>`;
    return;
  }
  detailPane.innerHTML = `
    <form class="settings-form" id="settings-form">
      <div class="settings-head">
        <div>
          <h1>${escapeHTML(repoLabel(state))} settings</h1>
          <p>${escapeHTML(state.settingsRepo?.root || "")}</p>
        </div>
        <button class="btn btn-primary" id="settings-save" type="submit">Save settings</button>
      </div>
      <section class="settings-section">
        <h2>Implementer</h2>
        <div class="settings-grid">
          ${selectField("defaultAgent", "Default agent", cfg, AGENTS, "Use CLI default")}
          ${textField("defaultModel", "Default model", cfg, "gpt-5-codex")}
        </div>
      </section>
      <section class="settings-section">
        <h2>Review and fixes</h2>
        <div class="settings-grid">
          ${selectField("reviewerAgent", "Reviewer agent", cfg, AGENTS, "Unset")}
          ${textField("reviewerModel", "Reviewer model", cfg, "claude-opus-4-7")}
          ${selectField("reviewerReasoningEffort", "Reviewer reasoning", cfg, EFFORTS, "Unset")}
          ${selectField("fixerAgent", "Fixer agent", cfg, AGENTS, "Unset")}
          ${textField("fixerModel", "Fixer model", cfg, "gpt-5-codex")}
          ${selectField("fixerReasoningEffort", "Fixer reasoning", cfg, EFFORTS, "Unset")}
          ${textField("autoFixRounds", "Auto-fix rounds", cfg, "1")}
        </div>
        ${boolField("autoFix", "Run auto-fix after review findings", cfg, "off")}
      </section>
      <section class="settings-section">
        <h2>Critique</h2>
        <div class="settings-grid">
          ${selectField("critiqueAgentA", "Critic A agent", cfg, AGENTS, "Unset")}
          ${textField("critiqueModelA", "Critic A model", cfg, "claude-opus-4-7")}
          ${selectField("critiqueReasoningA", "Critic A reasoning", cfg, EFFORTS, "Unset")}
          ${selectField("critiqueAgentB", "Critic B agent", cfg, AGENTS, "Unset")}
          ${textField("critiqueModelB", "Critic B model", cfg, "gpt-5-codex")}
          ${selectField("critiqueReasoningB", "Critic B reasoning", cfg, EFFORTS, "Unset")}
          ${selectField("critiqueAgentSynth", "Synthesizer agent", cfg, AGENTS, "Unset")}
          ${textField("critiqueModelSynth", "Synthesizer model", cfg, "gpt-5-codex")}
          ${selectField("critiqueReasoningSynth", "Synthesizer reasoning", cfg, EFFORTS, "Unset")}
        </div>
      </section>
      <section class="settings-section">
        <h2>Spec improvement</h2>
        <div class="settings-grid">
          ${selectField("improverAgent", "Improver agent", cfg, AGENTS, "Unset")}
          ${textField("improverModel", "Improver model", cfg, "gpt-5-codex")}
          ${selectField("improverReasoning", "Improver reasoning", cfg, EFFORTS, "Unset")}
        </div>
        ${boolField("autoImprove", "Run auto-improve after saving a spec", cfg, "on")}
      </section>
      <section class="settings-section">
        <h2>Integrations</h2>
        <div class="settings-grid">
          ${textField("ghUser", "GitHub user", cfg, "account login for gh auth token")}
          ${textField("ghHost", "GitHub host", cfg, "github.com or GHES host")}
          ${textField("jiraProject", "Jira project", cfg, "FORGE")}
          ${textField("jiraType", "Jira issue type", cfg, "Task")}
        </div>
      </section>
    </form>
  `;
  $("#settings-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!state.settingsRepo?.root) return;
    const btn = $("#settings-save");
    btn.disabled = true;
    btn.textContent = "Saving…";
    try {
      const data = await apiPost("/api/config", { repoRoot: state.settingsRepo.root, config: readPatch(e.currentTarget) });
      state.settingsConfig = data.config || {};
      showToast("Settings saved", "info");
      renderSettingsMode(state);
    } catch (err) {
      showToast(err.hint ? `${err.message} — ${err.hint}` : err.message || "Could not save settings", "error");
      btn.disabled = false;
      btn.textContent = "Save settings";
    }
  });
}

export function clearSettingsModeShell() {
  $("#list-pane").classList.remove("settings-list-pane");
  $("#detail-pane").classList.remove("settings-detail-pane");
}
