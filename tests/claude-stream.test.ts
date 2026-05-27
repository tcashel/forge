import * as assert from "node:assert/strict";
import * as path from "node:path";
import { test } from "node:test";
import { parseResultEvent, readResultFromFile } from "../src/core/claude-stream.ts";

const FIXTURE = path.join(import.meta.dir, "fixtures", "claude-stream-result.jsonl");

test("parseResultEvent extracts tokens + cost from a real result event", () => {
  const evt = {
    type: "result",
    subtype: "success",
    duration_ms: 1655,
    num_turns: 1,
    stop_reason: "end_turn",
    total_cost_usd: 0.0675945,
    usage: {
      input_tokens: 5,
      cache_creation_input_tokens: 9396,
      cache_read_input_tokens: 16591,
      output_tokens: 6,
    },
  };
  const parsed = parseResultEvent(evt);
  assert.ok(parsed, "result event parses");
  assert.equal(parsed?.durationMs, 1655);
  assert.equal(parsed?.totalCostUsd, 0.0675945);
  assert.equal(parsed?.numTurns, 1);
  assert.equal(parsed?.stopReason, "end_turn");
  assert.equal(parsed?.tokensIn, 5);
  assert.equal(parsed?.tokensOut, 6);
  assert.equal(parsed?.cacheRead, 16591);
  assert.equal(parsed?.cacheCreate, 9396);
});

test("parseResultEvent returns null on non-result events", () => {
  assert.equal(parseResultEvent({ type: "assistant" }), null);
  assert.equal(parseResultEvent({ type: "system", subtype: "init" }), null);
});

test("readResultFromFile reads the final result event from a JSONL stream", async () => {
  const r = await readResultFromFile(FIXTURE);
  assert.equal(r.tokensIn, 5);
  assert.equal(r.tokensOut, 6);
  assert.equal(r.cacheRead, 16591);
  assert.equal(r.cacheCreate, 9396);
  assert.equal(r.totalCostUsd, 0.0675945);
});

test("readResultFromFile returns null metrics when file is missing", async () => {
  const r = await readResultFromFile("/tmp/forge-test-does-not-exist.jsonl");
  assert.equal(r.tokensIn, null);
  assert.equal(r.tokensOut, null);
  assert.equal(r.totalCostUsd, null);
});
