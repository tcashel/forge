import * as assert from "node:assert/strict";
import * as path from "node:path";
import { test } from "node:test";
import { parseCodexTurnEvent, readCodexResultFromFile } from "../src/core/codex-stream.ts";
import { estimateCost } from "../src/core/pricing.ts";

const FIXTURE = path.join(import.meta.dir, "fixtures", "codex-stream-result.jsonl");

test("parseCodexTurnEvent extracts tokens from a real turn.completed event", () => {
  const evt = {
    type: "turn.completed",
    usage: { input_tokens: 14575, cached_input_tokens: 4480, output_tokens: 6, reasoning_output_tokens: 0 },
  };
  const parsed = parseCodexTurnEvent(evt);
  assert.ok(parsed, "turn.completed event parses");
  assert.equal(parsed?.tokensIn, 14575);
  assert.equal(parsed?.tokensOut, 6);
  assert.equal(parsed?.cacheRead, 4480);
  assert.equal(parsed?.cacheCreate, null);
  assert.equal(parsed?.totalCostUsd, null, "codex reports tokens only");
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
  assert.equal(r.tokensIn, 14575);
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
  // codex folds cached input into input_tokens, so the 4480 cached tokens
  // bill at the $0.50/1M cached rate and only the remaining 10095 at $5/1M.
  // (14575 - 4480) in * $5/1M + 4480 cached * $0.50/1M + 6 out * $30/1M
  const expected = ((14575 - 4480) * 5 + 4480 * 0.5 + 6 * 30) / 1_000_000;
  assert.ok(Math.abs((est.costUsd ?? 0) - expected) < 1e-12, `expected ${expected}, got ${est.costUsd}`);
});

test("estimateCost charges cached input at the full rate when no cached count is passed", () => {
  // Backstop: without cachedTokensIn, every input token bills at inputPer1M.
  const est = estimateCost({ agentAdapter: "codex", model: "gpt-5.5", tokensIn: 14575, tokensOut: 6 });
  const expected = (14575 * 5 + 6 * 30) / 1_000_000;
  assert.ok(Math.abs((est.costUsd ?? 0) - expected) < 1e-12, `expected ${expected}, got ${est.costUsd}`);
});

test("estimateCost cached pricing is strictly cheaper than full-rate input", async () => {
  const r = await readCodexResultFromFile(FIXTURE);
  const cached = estimateCost({
    agentAdapter: "codex",
    model: "gpt-5.5",
    tokensIn: r.tokensIn,
    tokensOut: r.tokensOut,
    cachedTokensIn: r.cacheRead,
  });
  const fullRate = estimateCost({
    agentAdapter: "codex",
    model: "gpt-5.5",
    tokensIn: r.tokensIn,
    tokensOut: r.tokensOut,
  });
  assert.ok(
    (cached.costUsd ?? 0) < (fullRate.costUsd ?? 0),
    "nonzero cached input must lower the estimate vs charging it all at the full input rate",
  );
});

test("estimateCost clamps a cached count larger than tokensIn", () => {
  // A malformed cached count must never produce negative full-rate input.
  const est = estimateCost({
    agentAdapter: "codex",
    model: "gpt-5.5",
    tokensIn: 100,
    tokensOut: 0,
    cachedTokensIn: 9999,
  });
  // All 100 input tokens billed at the cached rate, none negative.
  const expected = (100 * 0.5) / 1_000_000;
  assert.ok(Math.abs((est.costUsd ?? 0) - expected) < 1e-12, `expected ${expected}, got ${est.costUsd}`);
});

test("estimateCost stays null for an unpriced codex model", () => {
  const est = estimateCost({ agentAdapter: "codex", model: "gpt-9-unknown", tokensIn: 100, tokensOut: 50 });
  assert.equal(est.costUsd, null);
  assert.equal(est.costSource, null);
});
