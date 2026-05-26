import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  AGENT_MODELS,
  DEFAULT_FALLBACK_AGENT,
  isKnownModel,
  pairedAgentKey,
  validateAgentModelPairs,
} from "../src/core/agent-models.ts";

test("isKnownModel: known and unknown pairs", () => {
  assert.equal(isKnownModel("claude", "claude-opus-4-7"), true);
  assert.equal(isKnownModel("codex", "gpt-5.5"), true);
  assert.equal(isKnownModel("claude", "gpt-5.5"), false);
  assert.equal(isKnownModel("codex", "claude-opus-4-7"), false);
});

test("pairedAgentKey: plain Model → Agent", () => {
  assert.equal(pairedAgentKey("improverModel"), "improverAgent");
  assert.equal(pairedAgentKey("defaultModel"), "defaultAgent");
  assert.equal(pairedAgentKey("reviewerModel"), "reviewerAgent");
  assert.equal(pairedAgentKey("fixerModel"), "fixerAgent");
});

test("pairedAgentKey: critique<A|B|Synth> shape", () => {
  assert.equal(pairedAgentKey("critiqueModelA"), "critiqueAgentA");
  assert.equal(pairedAgentKey("critiqueModelB"), "critiqueAgentB");
  assert.equal(pairedAgentKey("critiqueModelSynth"), "critiqueAgentSynth");
});

test("pairedAgentKey: returns null for non-model keys", () => {
  assert.equal(pairedAgentKey("autoFix"), null);
  assert.equal(pairedAgentKey("ghUser"), null);
});

test("validateAgentModelPairs: orphan improverModel rejected", () => {
  // The bug from session: improverModel set, improverAgent unset → falls back
  // to DEFAULT_FALLBACK_AGENT ("claude") → gpt-5.5 isn't a claude model.
  const errors = validateAgentModelPairs({ improverModel: "gpt-5.5" }, {});
  assert.equal(errors.length, 1);
  assert.equal(errors[0].modelKey, "improverModel");
  assert.equal(errors[0].agentKey, "improverAgent");
  assert.equal(errors[0].agent, DEFAULT_FALLBACK_AGENT);
  assert.equal(errors[0].model, "gpt-5.5");
});

test("validateAgentModelPairs: matched pair in same patch accepted", () => {
  const errors = validateAgentModelPairs({ improverAgent: "codex", improverModel: "gpt-5.5" }, {});
  assert.equal(errors.length, 0);
});

test("validateAgentModelPairs: matched pair via stored config accepted", () => {
  // Patch only sets the model; the agent is already pinned in current.
  const errors = validateAgentModelPairs({ critiqueModelA: "gpt-5.5" }, { critiqueAgentA: "codex" });
  assert.equal(errors.length, 0);
});

test("validateAgentModelPairs: mismatched stored agent rejected", () => {
  const errors = validateAgentModelPairs({ critiqueModelA: "gpt-5.5" }, { critiqueAgentA: "claude" });
  assert.equal(errors.length, 1);
  assert.equal(errors[0].agent, "claude");
});

test("validateAgentModelPairs: clearing a model is fine", () => {
  // Sending empty/null/undefined clears the field; nothing to validate.
  assert.equal(validateAgentModelPairs({ improverModel: "" }, {}).length, 0);
  assert.equal(validateAgentModelPairs({ improverModel: null }, {}).length, 0);
  assert.equal(validateAgentModelPairs({ improverModel: undefined }, {}).length, 0);
});

test("validateAgentModelPairs: non-model keys are ignored", () => {
  const errors = validateAgentModelPairs({ ghUser: "tcashel", autoFix: true, autoFixRounds: 3 }, {});
  assert.equal(errors.length, 0);
});

test("validateAgentModelPairs: registry includes the configured models we use today", () => {
  // Smoke test that the hardcoded registry hasn't gotten out of sync
  // with the agents Forge actually drives.
  assert.ok(AGENT_MODELS.claude.length > 0);
  assert.ok(AGENT_MODELS.codex.length > 0);
  assert.ok(AGENT_MODELS.claude.includes("claude-opus-4-7"));
  assert.ok(AGENT_MODELS.codex.includes("gpt-5.5"));
});
