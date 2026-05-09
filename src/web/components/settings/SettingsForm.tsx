// Settings detail-pane form, ported from legacy `src/web/settings.js`.
//
// **Focus-loss fix lives here.** Form fields are component-local
// signals (`useSignal`). The 30s settings poll updates the
// `settingsConfig` signal but this component reads it ONLY during the
// initial mount + when the user clicks Reload. Mid-edit polls don't
// recreate any input nodes, so cursor + characters survive.
import { type Signal, useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";
import { type ApiError, apiPost } from "../../lib/api";
import {
  type RepoConfig,
  refreshSettings,
  settingsConfig,
  settingsError,
  settingsLoading,
  settingsRepo,
} from "../../signals/settings";
import { selectedRepo } from "../../signals/ui";

const AGENTS = ["", "claude", "codex", "opencode", "gemini"];
const EFFORTS = ["", "low", "medium", "high", "xhigh"];

// One signal per field. Stored as strings (selects/inputs) or booleans
// (checkboxes). Booleans use `null` for "not overridden, fall back to
// default" — matches legacy semantics where an undefined bool meant the
// repo inherited the default.
interface FormSignals {
  defaultAgent: Signal<string>;
  defaultModel: Signal<string>;
  reviewerAgent: Signal<string>;
  reviewerModel: Signal<string>;
  reviewerReasoningEffort: Signal<string>;
  fixerAgent: Signal<string>;
  fixerModel: Signal<string>;
  fixerReasoningEffort: Signal<string>;
  autoFixRounds: Signal<string>;
  autoFix: Signal<boolean | null>;
  critiqueAgentA: Signal<string>;
  critiqueModelA: Signal<string>;
  critiqueReasoningA: Signal<string>;
  critiqueAgentB: Signal<string>;
  critiqueModelB: Signal<string>;
  critiqueReasoningB: Signal<string>;
  critiqueAgentSynth: Signal<string>;
  critiqueModelSynth: Signal<string>;
  critiqueReasoningSynth: Signal<string>;
  improverAgent: Signal<string>;
  improverModel: Signal<string>;
  improverReasoning: Signal<string>;
  autoImprove: Signal<boolean | null>;
  ghUser: Signal<string>;
  ghHost: Signal<string>;
  jiraProject: Signal<string>;
  jiraType: Signal<string>;
}

function applyConfig(form: FormSignals, cfg: RepoConfig) {
  form.defaultAgent.value = cfg.defaultAgent ?? "";
  form.defaultModel.value = cfg.defaultModel ?? "";
  form.reviewerAgent.value = cfg.reviewerAgent ?? "";
  form.reviewerModel.value = cfg.reviewerModel ?? "";
  form.reviewerReasoningEffort.value = cfg.reviewerReasoningEffort ?? "";
  form.fixerAgent.value = cfg.fixerAgent ?? "";
  form.fixerModel.value = cfg.fixerModel ?? "";
  form.fixerReasoningEffort.value = cfg.fixerReasoningEffort ?? "";
  form.autoFixRounds.value = cfg.autoFixRounds != null ? String(cfg.autoFixRounds) : "";
  form.autoFix.value = cfg.autoFix === undefined ? null : cfg.autoFix;
  form.critiqueAgentA.value = cfg.critiqueAgentA ?? "";
  form.critiqueModelA.value = cfg.critiqueModelA ?? "";
  form.critiqueReasoningA.value = cfg.critiqueReasoningA ?? "";
  form.critiqueAgentB.value = cfg.critiqueAgentB ?? "";
  form.critiqueModelB.value = cfg.critiqueModelB ?? "";
  form.critiqueReasoningB.value = cfg.critiqueReasoningB ?? "";
  form.critiqueAgentSynth.value = cfg.critiqueAgentSynth ?? "";
  form.critiqueModelSynth.value = cfg.critiqueModelSynth ?? "";
  form.critiqueReasoningSynth.value = cfg.critiqueReasoningSynth ?? "";
  form.improverAgent.value = cfg.improverAgent ?? "";
  form.improverModel.value = cfg.improverModel ?? "";
  form.improverReasoning.value = cfg.improverReasoning ?? "";
  form.autoImprove.value = cfg.autoImprove === undefined ? null : cfg.autoImprove;
  form.ghUser.value = cfg.ghUser ?? "";
  form.ghHost.value = cfg.ghHost ?? "";
  form.jiraProject.value = cfg.jiraProject ?? "";
  form.jiraType.value = cfg.jiraType ?? "";
}

// Build the patch object that `/api/config` expects. Strings turn into
// `null` when blank (signals "clear this override"); the two booleans
// preserve their tri-state by sending `null` when the user hasn't
// touched the inherited default.
function buildPatch(form: FormSignals): Record<string, string | number | boolean | null> {
  const str = (v: string) => (v.trim() ? v.trim() : null);
  const num = (v: string) => {
    const t = v.trim();
    if (!t) return null;
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
  };
  return {
    defaultAgent: str(form.defaultAgent.value),
    defaultModel: str(form.defaultModel.value),
    reviewerAgent: str(form.reviewerAgent.value),
    reviewerModel: str(form.reviewerModel.value),
    reviewerReasoningEffort: str(form.reviewerReasoningEffort.value),
    fixerAgent: str(form.fixerAgent.value),
    fixerModel: str(form.fixerModel.value),
    fixerReasoningEffort: str(form.fixerReasoningEffort.value),
    autoFixRounds: num(form.autoFixRounds.value),
    autoFix: form.autoFix.value,
    critiqueAgentA: str(form.critiqueAgentA.value),
    critiqueModelA: str(form.critiqueModelA.value),
    critiqueReasoningA: str(form.critiqueReasoningA.value),
    critiqueAgentB: str(form.critiqueAgentB.value),
    critiqueModelB: str(form.critiqueModelB.value),
    critiqueReasoningB: str(form.critiqueReasoningB.value),
    critiqueAgentSynth: str(form.critiqueAgentSynth.value),
    critiqueModelSynth: str(form.critiqueModelSynth.value),
    critiqueReasoningSynth: str(form.critiqueReasoningSynth.value),
    improverAgent: str(form.improverAgent.value),
    improverModel: str(form.improverModel.value),
    improverReasoning: str(form.improverReasoning.value),
    autoImprove: form.autoImprove.value,
    ghUser: str(form.ghUser.value),
    ghHost: str(form.ghHost.value),
    jiraProject: str(form.jiraProject.value),
    jiraType: str(form.jiraType.value),
  };
}

function toast(msg: string, kind: "info" | "error" = "info") {
  window.__forge?.legacy?.showToast?.(msg, kind);
}

interface TextFieldProps {
  id: string;
  label: string;
  signal: Signal<string>;
  placeholder?: string;
}
function TextField({ id, label, signal, placeholder }: TextFieldProps) {
  return (
    <label class="settings-field" for={id}>
      <span>{label}</span>
      <input
        id={id}
        type="text"
        value={signal.value}
        placeholder={placeholder || ""}
        onInput={(e) => {
          signal.value = (e.currentTarget as HTMLInputElement).value;
        }}
      />
    </label>
  );
}

interface SelectFieldProps {
  id: string;
  label: string;
  signal: Signal<string>;
  values: string[];
  emptyLabel: string;
}
function SelectField({ id, label, signal, values, emptyLabel }: SelectFieldProps) {
  return (
    <label class="settings-field" for={id}>
      <span>{label}</span>
      <select
        id={id}
        value={signal.value}
        onChange={(e) => {
          signal.value = (e.currentTarget as HTMLSelectElement).value;
        }}
      >
        {values.map((v) => (
          <option key={v} value={v}>
            {v || emptyLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

interface BoolFieldProps {
  id: string;
  signal: Signal<boolean | null>;
  label: string;
  defaultLabel: "on" | "off";
}
function BoolField({ id, signal, label, defaultLabel }: BoolFieldProps) {
  const defaultChecked = defaultLabel === "on";
  const inherited = signal.value === null;
  const checked = inherited ? defaultChecked : signal.value === true;
  return (
    <label class="settings-check" for={id}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => {
          const next = (e.currentTarget as HTMLInputElement).checked;
          // Match legacy: if the user toggles back to the default value
          // while the field was inherited, clear the override (null).
          // Otherwise persist the explicit boolean.
          signal.value = inherited && next === defaultChecked ? null : next;
        }}
      />
      <span>{label}</span>
      <small>{inherited ? `default ${defaultLabel}` : "repo override"}</small>
    </label>
  );
}

export function SettingsForm() {
  const initialized = useRef<boolean>(false);
  const lastSavedAt = useSignal<Date | null>(null);
  const saving = useSignal<boolean>(false);

  const form: FormSignals = {
    defaultAgent: useSignal(""),
    defaultModel: useSignal(""),
    reviewerAgent: useSignal(""),
    reviewerModel: useSignal(""),
    reviewerReasoningEffort: useSignal(""),
    fixerAgent: useSignal(""),
    fixerModel: useSignal(""),
    fixerReasoningEffort: useSignal(""),
    autoFixRounds: useSignal(""),
    autoFix: useSignal<boolean | null>(null),
    critiqueAgentA: useSignal(""),
    critiqueModelA: useSignal(""),
    critiqueReasoningA: useSignal(""),
    critiqueAgentB: useSignal(""),
    critiqueModelB: useSignal(""),
    critiqueReasoningB: useSignal(""),
    critiqueAgentSynth: useSignal(""),
    critiqueModelSynth: useSignal(""),
    critiqueReasoningSynth: useSignal(""),
    improverAgent: useSignal(""),
    improverModel: useSignal(""),
    improverReasoning: useSignal(""),
    autoImprove: useSignal<boolean | null>(null),
    ghUser: useSignal(""),
    ghHost: useSignal(""),
    jiraProject: useSignal(""),
    jiraType: useSignal(""),
  };

  // Mount: kick off a fetch (if we don't already have data) and seed
  // the form-local signals exactly once. After this `useEffect` returns
  // we never read settingsConfig again, so the 30s poll cannot replace
  // the user's typed-but-unsaved changes.
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (settingsConfig.value === null) {
        await refreshSettings(selectedRepo.value || null);
      }
      if (cancelled) return;
      const cfg = settingsConfig.value || {};
      applyConfig(form, cfg);
      initialized.current = true;
    };
    void run();
    return () => {
      cancelled = true;
    };
    // Run only once on mount — explicit "Reload" button re-syncs after that.
  }, []);

  // When the user picks a different repo we re-fetch and re-seed. This
  // is an explicit context switch (not a poll), so blowing away the
  // form is the right move.
  useEffect(() => {
    if (!initialized.current) return;
    let cancelled = false;
    const run = async () => {
      await refreshSettings(selectedRepo.value || null);
      if (cancelled) return;
      applyConfig(form, settingsConfig.value || {});
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [selectedRepo.value]);

  const repo = settingsRepo.value;
  const loading = settingsLoading.value;
  const error = settingsError.value;
  const headerName = repo?.name || selectedRepo.value || "Current repo";

  const onSave = async (e: Event) => {
    e.preventDefault();
    if (!repo?.root) return;
    saving.value = true;
    try {
      const data = await apiPost<{ config: RepoConfig }>("/api/config", {
        repoRoot: repo.root,
        config: buildPatch(form),
      });
      settingsConfig.value = data.config || {};
      lastSavedAt.value = new Date();
      toast("Settings saved", "info");
    } catch (err) {
      const e2 = err as ApiError;
      toast(e2.hint ? `${e2.message} — ${e2.hint}` : e2.message || "Could not save settings", "error");
    } finally {
      saving.value = false;
    }
  };

  const onReload = async () => {
    // Inline confirm matches the spec ("only allowed if no unsaved
    // edits, OR confirms via a small inline note"). We can't easily
    // detect "dirty" without diffing, so prompt unconditionally except
    // when the form is currently fetch-pending.
    const ok = window.confirm("Discard any unsaved edits and reload settings from disk?");
    if (!ok) return;
    await refreshSettings(selectedRepo.value || null);
    applyConfig(form, settingsConfig.value || {});
    toast("Settings reloaded", "info");
  };

  if (loading && !initialized.current) {
    return <div class="detail-empty">Loading settings…</div>;
  }
  if (error) {
    return (
      <div class="detail-empty pr-empty">
        <div>
          <div class="big">Settings unavailable</div>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const lastSaved = lastSavedAt.value;
  return (
    <form class="settings-form" id="settings-form" onSubmit={onSave}>
      <div class="settings-head">
        <div>
          <h1>{headerName} settings</h1>
          <p>{repo?.root || ""}</p>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          {lastSaved ? (
            <span style="color:var(--dim);font-size:12px;font-family:'JetBrains Mono',monospace">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          ) : null}
          <button type="button" class="btn btn-ghost" onClick={onReload}>
            Reload
          </button>
          <button class="btn btn-primary" id="settings-save" type="submit" disabled={saving.value}>
            {saving.value ? "Saving…" : "Save settings"}
          </button>
        </div>
      </div>
      <section class="settings-section">
        <h2>Implementer</h2>
        <div class="settings-grid">
          <SelectField
            id="cfg-defaultAgent"
            label="Default agent"
            signal={form.defaultAgent}
            values={AGENTS}
            emptyLabel="Use CLI default"
          />
          <TextField id="cfg-defaultModel" label="Default model" signal={form.defaultModel} placeholder="gpt-5-codex" />
        </div>
      </section>
      <section class="settings-section">
        <h2>Review and fixes</h2>
        <div class="settings-grid">
          <SelectField
            id="cfg-reviewerAgent"
            label="Reviewer agent"
            signal={form.reviewerAgent}
            values={AGENTS}
            emptyLabel="Unset"
          />
          <TextField
            id="cfg-reviewerModel"
            label="Reviewer model"
            signal={form.reviewerModel}
            placeholder="claude-opus-4-7"
          />
          <SelectField
            id="cfg-reviewerReasoning"
            label="Reviewer reasoning"
            signal={form.reviewerReasoningEffort}
            values={EFFORTS}
            emptyLabel="Unset"
          />
          <SelectField
            id="cfg-fixerAgent"
            label="Fixer agent"
            signal={form.fixerAgent}
            values={AGENTS}
            emptyLabel="Unset"
          />
          <TextField id="cfg-fixerModel" label="Fixer model" signal={form.fixerModel} placeholder="gpt-5-codex" />
          <SelectField
            id="cfg-fixerReasoning"
            label="Fixer reasoning"
            signal={form.fixerReasoningEffort}
            values={EFFORTS}
            emptyLabel="Unset"
          />
          <TextField id="cfg-autoFixRounds" label="Auto-fix rounds" signal={form.autoFixRounds} placeholder="1" />
        </div>
        <BoolField
          id="cfg-autoFix"
          signal={form.autoFix}
          label="Run auto-fix after review findings"
          defaultLabel="off"
        />
      </section>
      <section class="settings-section">
        <h2>Critique</h2>
        <div class="settings-grid">
          <SelectField
            id="cfg-critiqueAgentA"
            label="Critic A agent"
            signal={form.critiqueAgentA}
            values={AGENTS}
            emptyLabel="Unset"
          />
          <TextField
            id="cfg-critiqueModelA"
            label="Critic A model"
            signal={form.critiqueModelA}
            placeholder="claude-opus-4-7"
          />
          <SelectField
            id="cfg-critiqueReasoningA"
            label="Critic A reasoning"
            signal={form.critiqueReasoningA}
            values={EFFORTS}
            emptyLabel="Unset"
          />
          <SelectField
            id="cfg-critiqueAgentB"
            label="Critic B agent"
            signal={form.critiqueAgentB}
            values={AGENTS}
            emptyLabel="Unset"
          />
          <TextField
            id="cfg-critiqueModelB"
            label="Critic B model"
            signal={form.critiqueModelB}
            placeholder="gpt-5-codex"
          />
          <SelectField
            id="cfg-critiqueReasoningB"
            label="Critic B reasoning"
            signal={form.critiqueReasoningB}
            values={EFFORTS}
            emptyLabel="Unset"
          />
          <SelectField
            id="cfg-critiqueAgentSynth"
            label="Synthesizer agent"
            signal={form.critiqueAgentSynth}
            values={AGENTS}
            emptyLabel="Unset"
          />
          <TextField
            id="cfg-critiqueModelSynth"
            label="Synthesizer model"
            signal={form.critiqueModelSynth}
            placeholder="gpt-5-codex"
          />
          <SelectField
            id="cfg-critiqueReasoningSynth"
            label="Synthesizer reasoning"
            signal={form.critiqueReasoningSynth}
            values={EFFORTS}
            emptyLabel="Unset"
          />
        </div>
      </section>
      <section class="settings-section">
        <h2>Spec improvement</h2>
        <div class="settings-grid">
          <SelectField
            id="cfg-improverAgent"
            label="Improver agent"
            signal={form.improverAgent}
            values={AGENTS}
            emptyLabel="Unset"
          />
          <TextField
            id="cfg-improverModel"
            label="Improver model"
            signal={form.improverModel}
            placeholder="gpt-5-codex"
          />
          <SelectField
            id="cfg-improverReasoning"
            label="Improver reasoning"
            signal={form.improverReasoning}
            values={EFFORTS}
            emptyLabel="Unset"
          />
        </div>
        <BoolField
          id="cfg-autoImprove"
          signal={form.autoImprove}
          label="Run auto-improve after saving a spec"
          defaultLabel="on"
        />
      </section>
      <section class="settings-section">
        <h2>Integrations</h2>
        <div class="settings-grid">
          <TextField
            id="cfg-ghUser"
            label="GitHub user"
            signal={form.ghUser}
            placeholder="account login for gh auth token"
          />
          <TextField id="cfg-ghHost" label="GitHub host" signal={form.ghHost} placeholder="github.com or GHES host" />
          <TextField id="cfg-jiraProject" label="Jira project" signal={form.jiraProject} placeholder="FORGE" />
          <TextField id="cfg-jiraType" label="Jira issue type" signal={form.jiraType} placeholder="Task" />
        </div>
      </section>
    </form>
  );
}
