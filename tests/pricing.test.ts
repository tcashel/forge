import * as assert from "node:assert/strict";
import { test } from "node:test";
import { estimateCost } from "../src/core/pricing.ts";

// Guards the invariant that the codex/claude token normalization (splitting
// cached out of the raw input at parse time instead of inside pricing) does
// NOT move any cost. These are the post-normalization buckets from a real
// gpt-5.5 review row whose stored cost was $2.184158 before the change.
test("estimateCost reproduces the known gpt-5.5 review cost under normalized buckets", () => {
  const est = estimateCost({
    agentAdapter: "codex",
    model: "gpt-5.5",
    tokensIn: 191656, // uncached input (raw 1,825,192 total − 1,633,536 cached)
    tokensOut: 13637,
    cachedTokensIn: 1633536,
  });
  assert.equal(est.costSource, "estimate");
  assert.equal(est.modelPricedAt, "2026-05-31");
  assert.ok(Math.abs((est.costUsd ?? 0) - 2.184158) < 1e-9, `expected 2.184158, got ${est.costUsd}`);
});

test("estimateCost stays null for claude (provider cost is the source of truth)", () => {
  const est = estimateCost({
    agentAdapter: "claude",
    model: "claude-opus-4-7",
    tokensIn: 124,
    tokensOut: 104427,
    cachedTokensIn: 22962031,
  });
  assert.equal(est.costUsd, null);
  assert.equal(est.costSource, null);
});

test("estimateCost is null when tokens are unknown", () => {
  const est = estimateCost({ agentAdapter: "codex", model: "gpt-5.5", tokensIn: null, tokensOut: null });
  assert.equal(est.costUsd, null);
  assert.equal(est.costSource, null);
});
