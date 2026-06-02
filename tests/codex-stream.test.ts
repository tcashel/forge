import * as assert from "node:assert/strict";
import * as path from "node:path";
import { test } from "node:test";
import { parseCodexTurnEvent, readCodexResultFromFile } from "../src/core/codex-stream.ts";
import { estimateCost } from "../src/core/pricing.ts";

const FIXTURE = path.join(import.meta.dir, "fixtures", "codex-stream-result.jsonl");

test("parseCodexTurnEvent splits cached out of the raw input total", () => {
  const evt = {
    type: "turn.completed",
    usage: { input_tokens: 14575, cached_input_tokens: 4480, output_tokens: 6, reasoning_output_tokens: 0 },
  };
  const parsed = parseCodexTurnEvent(evt);
  assert.ok(parsed, "turn.completed event parses");
  // codex's input_tokens is the TOTAL (cached included); tokensIn is normalized
  // to uncached-only so it matches claude's disjoint-counts semantics.
  assert.equal(parsed?.tokensIn, 14575 - 4480, "tokensIn excludes the cached portion");
  assert.equal(parsed?.tokensOut, 6);
  assert.equal(parsed?.cacheRead, 4480);
  assert.equal(parsed?.cacheCreate, null);
  assert.equal(parsed?.totalCostUsd, null, "codex reports tokens only");
});

test("parseCodexTurnEvent clamps cached > total to a non-negative tokensIn", () => {
  const parsed = parseCodexTurnEvent({
    type: "turn.completed",
    usage: { input_tokens: 100, cached_input_tokens: 9999, output_tokens: 0 },
  });
  assert.equal(parsed?.tokensIn, 0, "malformed cached > total must not go negative");
  assert.equal(parsed?.cacheRead, 9999);
});

test("parseCodexTurnEvent returns null on non-usage events", () => {
  assert.equal(parseCodexTurnEvent({ type: "thread.started" }), null);
  assert.equal(parseCodexTurnEvent({ type: "item.completed", item: { type: "agent_message", text: "Hi." } }), null);
  assert.equal(parseCodexTurnEvent({ type: "turn.completed" }), null, "no usage object → null");
});

test("readCodexResultFromFile reads non-null tokens from the captured fixture", async () => {
  const r = await readCodexResultFromFile(FIXTURE);
  assert.notEqual(r.tokensIn, null, "tokensIn must be non-null — guards against a wrong field mapping");
  assert.notEqual(r.tokensOut, null, "tokensOut must be non-null");
  assert.equal(r.tokensIn, 14575 - 4480, "tokensIn is the uncached portion");
  assert.equal(r.tokensOut, 6);
  assert.equal(r.cacheRead, 4480);
  assert.equal(r.totalCostUsd, null);
});

test("readCodexResultFromFile returns null metrics when file is missing", async () => {
  const r = await readCodexResultFromFile("/tmp/forge-test-codex-does-not-exist.jsonl");
  assert.equal(r.tokensIn, null);
  assert.equal(r.tokensOut, null);
});

test("estimateCost returns a non-null cost for codex gpt-5.5 from captured tokens", async () => {
  const r = await readCodexResultFromFile(FIXTURE);
  const est = estimateCost({
    agentAdapter: "codex",
    model: "gpt-5.5",
    tokensIn: r.tokensIn,
    tokensOut: r.tokensOut,
    cachedTokensIn: r.cacheRead,
  });
  assert.notEqual(est.costUsd, null, "priced model must produce a non-null cost");
  assert.equal(est.costSource, "estimate");
  // tokensIn is uncached (10095), cacheRead is the cached portion (4480):
  // 10095 in * $5/1M + 4480 cached * $0.50/1M + 6 out * $30/1M. This must match
  // the pre-normalization cost exactly (the split moved from pricing to parse).
  const expected = (10095 * 5 + 4480 * 0.5 + 6 * 30) / 1_000_000;
  assert.ok(Math.abs((est.costUsd ?? 0) - expected) < 1e-12, `expected ${expected}, got ${est.costUsd}`);
});

test("estimateCost charges cached input at the full rate when no cached count is passed", () => {
  // Backstop: without cachedTokensIn, every input token bills at inputPer1M.
  const est = estimateCost({ agentAdapter: "codex", model: "gpt-5.5", tokensIn: 14575, tokensOut: 6 });
  const expected = (14575 * 5 + 6 * 30) / 1_000_000;
  assert.ok(Math.abs((est.costUsd ?? 0) - expected) < 1e-12, `expected ${expected}, got ${est.costUsd}`);
});

test("estimateCost prices cached input cheaper than the same tokens at the full rate", async () => {
  const r = await readCodexResultFromFile(FIXTURE);
  // Discounted: 10095 uncached + 4480 cached (cacheRead billed at $0.50/1M).
  const cached = estimateCost({
    agentAdapter: "codex",
    model: "gpt-5.5",
    tokensIn: r.tokensIn,
    tokensOut: r.tokensOut,
    cachedTokensIn: r.cacheRead,
  });
  // Counterfactual: the same total input (10095 + 4480) all at the full rate.
  const allFullRate = estimateCost({
    agentAdapter: "codex",
    model: "gpt-5.5",
    tokensIn: (r.tokensIn ?? 0) + (r.cacheRead ?? 0),
    tokensOut: r.tokensOut,
  });
  assert.ok(
    (cached.costUsd ?? 0) < (allFullRate.costUsd ?? 0),
    "the cached portion must bill at the discounted rate, lowering the estimate",
  );
});

test("estimateCost clamps a negative cached count to zero", () => {
  // tokensIn is already uncached, so cached is just an additive discounted
  // bucket — a malformed negative count must not subtract from the cost.
  const est = estimateCost({
    agentAdapter: "codex",
    model: "gpt-5.5",
    tokensIn: 100,
    tokensOut: 0,
    cachedTokensIn: -9999,
  });
  const expected = (100 * 5) / 1_000_000;
  assert.ok(Math.abs((est.costUsd ?? 0) - expected) < 1e-12, `expected ${expected}, got ${est.costUsd}`);
});

test("estimateCost stays null for an unpriced codex model", () => {
  const est = estimateCost({ agentAdapter: "codex", model: "gpt-9-unknown", tokensIn: 100, tokensOut: 50 });
  assert.equal(est.costUsd, null);
  assert.equal(est.costSource, null);
});
