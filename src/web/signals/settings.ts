// Settings signals + a 30s background poll. The poll only ever writes
// to the data signals here; the `<SettingsForm/>` component reads from
// `settingsConfig` exactly once on mount (and on a manual Reload click)
// and stores form fields in component-local signals. That split is
// the structural fix for the focus-loss bug class — mid-edit polls
// don't recreate the input nodes.
import { signal } from "@preact/signals";
import { type ApiError, apiGet } from "../lib/api";
import type { RepoView } from "../types";
import { selectedRepo, viewMode } from "./ui";

// Mirror of `RepoConfig` from src/core/store.ts. We keep this loose
// because the form treats every field as an optional string/bool/num.
export interface RepoConfig {
  jiraProject?: string;
  jiraType?: string;
  defaultAgent?: string;
  defaultModel?: string;
  critiqueAgentA?: string;
  critiqueModelA?: string;
  critiqueReasoningA?: string;
  critiqueAgentB?: string;
  critiqueModelB?: string;
  critiqueReasoningB?: string;
  critiqueAgentSynth?: string;
  critiqueModelSynth?: string;
  critiqueReasoningSynth?: string;
  reviewerAgent?: string;
  reviewerModel?: string;
  reviewerReasoningEffort?: string;
  fixerAgent?: string;
  fixerModel?: string;
  fixerReasoningEffort?: string;
  autoFix?: boolean;
  autoFixRounds?: number;
  autoImprove?: boolean;
  improverAgent?: string;
  improverModel?: string;
  improverReasoning?: string;
  ghUser?: string;
  ghHost?: string;
}

export interface SettingsResponse {
  repo: RepoView | null;
  config: RepoConfig;
}

export const settingsConfig = signal<RepoConfig | null>(null);
export const settingsRepo = signal<RepoView | null>(null);
export const settingsLoading = signal<boolean>(false);
export const settingsError = signal<string | null>(null);

export async function refreshSettings(repoKey: string | null): Promise<void> {
  settingsLoading.value = true;
  settingsError.value = null;
  try {
    const q = repoKey ? `?repo=${encodeURIComponent(repoKey)}` : "";
    const data = await apiGet<SettingsResponse>(`/api/config${q}`);
    settingsRepo.value = data.repo || null;
    settingsConfig.value = data.config || {};
  } catch (e) {
    const err = e as ApiError;
    settingsRepo.value = null;
    settingsConfig.value = {};
    settingsError.value = err.hint ? `${err.message} — ${err.hint}` : err.message || "Could not load settings.";
  } finally {
    settingsLoading.value = false;
  }
}

let pollHandle: ReturnType<typeof setInterval> | null = null;

// Run a 30s poll only while we're on the settings view. The poll keeps
// `settingsConfig` fresh for any future "Reload" button interaction;
// the form itself doesn't observe this signal mid-edit.
export function startSettingsPolling(): void {
  if (pollHandle != null) return;
  pollHandle = setInterval(() => {
    if (viewMode.value !== "settings") return;
    void refreshSettings(selectedRepo.value || null);
  }, 30_000);
}

export function stopSettingsPolling(): void {
  if (pollHandle != null) {
    clearInterval(pollHandle);
    pollHandle = null;
  }
}
