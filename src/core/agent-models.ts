/**
 * Known-models registry per agent CLI.
 *
 * Hardcoded because each agent CLI exposes models inconsistently
 * (claude has no list flag, codex doesn't ship one either, etc.).
 * Update this file when a new model lands. The lists are non-exhaustive;
 * operators can always opt out via the "Custom…" escape hatch in the
 * settings UI, in which case the value bypasses validation.
 *
 * Used by:
 *   - GET /api/agents/models  (settings UI dropdowns)
 *   - validation in POST /api/config + `forge config set`  (prevents
 *     orphan model/agent pairs like {agent:"claude", model:"gpt-5.5"})
 */
import type { LaunchTarget } from "./store.ts";

export type AgentModelRegistry = Record<LaunchTarget, readonly string[]>;

// The first entry per agent is treated as the conventional default (it
// surfaces first in the settings dropdown). gpt-5-codex is intentionally
// NOT listed: it requires Codex-specific auth that ChatGPT-account logins
// reject, which silently breaks runs — gpt-5.5 is the codex default.
export const AGENT_MODELS: AgentModelRegistry = {
  claude: ["claude-opus-4-8", "claude-opus-4-7", "claude-sonnet-4-6", "claude-haiku-4-5", "claude-haiku-4-5-20251001"],
  codex: ["gpt-5.5", "gpt-5", "gpt-5-mini", "o3", "o3-mini"],
  opencode: ["claude-opus-4-8", "claude-opus-4-7", "claude-sonnet-4-6", "gpt-5", "gpt-5-mini"],
  gemini: ["gemini-2.0-pro", "gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
};

/** True iff `model` is in the registry for `agent`. */
export function isKnownModel(agent: LaunchTarget, model: string): boolean {
  return AGENT_MODELS[agent]?.includes(model) ?? false;
}

/** Default fallback agent for keys that aren't explicitly pinned (e.g. improverAgent omitted). */
export const DEFAULT_FALLBACK_AGENT: LaunchTarget = "claude";

/**
 * For a given model key (e.g. "improverModel"), returns the matching agent
 * key (e.g. "improverAgent"). Returns null if the field isn't a paired
 * model key. Used by validation to look up which agent governs a given
 * model field.
 */
export function pairedAgentKey(modelKey: string): string | null {
  if (!modelKey.endsWith("Model")) {
    // Handle critiqueModelA / critiqueModelB / critiqueModelSynth shape.
    const m = modelKey.match(/^(critique)Model([AB]|Synth)$/);
    if (m) return `${m[1]}Agent${m[2]}`;
    return null;
  }
  // Plain <prefix>Model → <prefix>Agent
  return `${modelKey.slice(0, -"Model".length)}Agent`;
}

/**
 * Validate a config patch against the registry. For every model field in
 * the patch (or already present in `current`), pick the matching agent
 * key, and if that agent is pinned anywhere (patch or current), check
 * model ∈ AGENT_MODELS[agent]. If the agent isn't pinned, falls back to
 * DEFAULT_FALLBACK_AGENT.
 *
 * Returns a list of validation errors. Empty list = patch is fine.
 */
export interface ModelValidationError {
  modelKey: string;
  agentKey: string;
  agent: LaunchTarget;
  model: string;
  allowed: readonly string[];
}

export function validateAgentModelPairs(
  patch: Record<string, unknown>,
  current: Record<string, unknown> = {},
): ModelValidationError[] {
  const errors: ModelValidationError[] = [];
  const merged: Record<string, unknown> = { ...current, ...patch };

  // Only validate fields that the *patch* is writing — legacy on-disk
  // orphans should still load. Catching them at write time is enough.
  for (const [key, value] of Object.entries(patch)) {
    const agentKey = pairedAgentKey(key);
    if (!agentKey) continue;
    if (value === undefined || value === null || value === "") continue;
    const model = String(value);

    const agentValue = merged[agentKey];
    const agent: LaunchTarget =
      typeof agentValue === "string" && agentValue ? (agentValue as LaunchTarget) : DEFAULT_FALLBACK_AGENT;

    if (!AGENT_MODELS[agent]) continue; // unknown agent — let the agent itself reject it
    if (isKnownModel(agent, model)) continue;

    errors.push({
      modelKey: key,
      agentKey,
      agent,
      model,
      allowed: AGENT_MODELS[agent],
    });
  }

  return errors;
}
