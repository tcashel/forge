/**
 * summarizeActivity — rolls up filtered Activity rows into the totals
 * strip and byModel chart payload.
 */

import { strict as assert } from "node:assert";
import { test } from "node:test";
import { absTime, summarizeActivity } from "../../src/web/components/activity/ActivityTable.tsx";
import type { AgentActivityRow } from "../../src/web/types.ts";

function row(overrides: Partial<AgentActivityRow> & { id: string }): AgentActivityRow {
  return {
    purpose: "critique",
    relatedId: null,
    agentAdapter: "claude",
    model: "opus-4-7",
    startedAt: "2026-05-29T00:00:00.000Z",
    finishedAt: null,
    state: "completed",
    exitCode: 0,
    metrics: {},
    jobRunNumber: null,
    branchName: null,
    plan: null,
    ...overrides,
  };
}

test("summarizeActivity sums zero for all-null rows and emits empty byModel", () => {
  const out = summarizeActivity([row({ id: "a" }), row({ id: "b" })]);
  assert.equal(out.runCount, 2);
  assert.equal(out.tokensIn, 0);
  assert.equal(out.tokensOut, 0);
  assert.equal(out.costUsd, 0);
  assert.deepEqual(out.byModel, []);
});

test("summarizeActivity sums mixed rows and excludes null cost", () => {
  const rows = [
    row({ id: "1", metrics: { tokensIn: 100, tokensOut: 50, costUsd: 0.1 } }),
    row({ id: "2", metrics: { tokensIn: null, tokensOut: 25, costUsd: null } }),
    row({ id: "3", metrics: { tokensIn: 200, tokensOut: 0, costUsd: 0.4 } }),
  ];
  const out = summarizeActivity(rows);
  assert.equal(out.runCount, 3);
  assert.equal(out.tokensIn, 300);
  assert.equal(out.tokensOut, 75);
  assert.ok(Math.abs(out.costUsd - 0.5) < 1e-9, `expected ~0.5, got ${out.costUsd}`);
});

test("summarizeActivity byModel orders desc by total tokens", () => {
  const rows = [
    row({ id: "1", model: "opus-4-7", metrics: { tokensIn: 100, tokensOut: 100 } }),
    row({ id: "2", model: "sonnet-4-6", metrics: { tokensIn: 50, tokensOut: 50 } }),
    row({ id: "3", model: "opus-4-7", metrics: { tokensIn: 400, tokensOut: 0 } }),
    row({ id: "4", model: "gpt-5", metrics: { tokensIn: null, tokensOut: null } }), // no token data → excluded
  ];
  const out = summarizeActivity(rows);
  assert.equal(out.byModel.length, 2, "gpt-5 row contributed no tokens so it's excluded");
  assert.equal(out.byModel[0].model, "opus-4-7");
  assert.equal(out.byModel[0].tokensIn, 500);
  assert.equal(out.byModel[0].tokensOut, 100);
  assert.equal(out.byModel[1].model, "sonnet-4-6");
});

test("summarizeActivity byPurpose aggregates per purpose and sums to grand totals", () => {
  const rows = [
    row({ id: "e1", purpose: "execution", metrics: { tokensIn: 100, tokensOut: 50, costUsd: 0.1 } }),
    row({ id: "r1", purpose: "review", metrics: { tokensIn: 200, tokensOut: 20, costUsd: 0.2 } }),
    row({ id: "r2", purpose: "review", metrics: { tokensIn: 300, tokensOut: 30, costUsd: 0.3 } }),
  ];
  const out = summarizeActivity(rows);
  const exec = out.byPurpose.find((p) => p.purposeLabel === "execution");
  const review = out.byPurpose.find((p) => p.purposeLabel === "review");
  assert.ok(exec && review);
  assert.equal(review?.runCount, 2);
  assert.equal(review?.tokensIn, 500);
  assert.equal(review?.tokensOut, 50);
  assert.ok(Math.abs((review?.costUsd ?? 0) - 0.5) < 1e-9);
  // breakdown sums to the grand totals
  const sumIn = out.byPurpose.reduce((s, p) => s + p.tokensIn, 0);
  const sumOut = out.byPurpose.reduce((s, p) => s + p.tokensOut, 0);
  const sumCost = out.byPurpose.reduce((s, p) => s + p.costUsd, 0);
  assert.equal(sumIn, out.tokensIn);
  assert.equal(sumOut, out.tokensOut);
  assert.ok(Math.abs(sumCost - out.costUsd) < 1e-9);
  // sorted desc by total tokens — review (550) before execution (150)
  assert.equal(out.byPurpose[0].purposeLabel, "review");
});

test("summarizeActivity byPurpose splits critic-a / critic-b via deriveLabel", () => {
  const rows = [
    row({ id: "s-critique-x-a", purpose: "critique", metrics: { tokensIn: 10, tokensOut: 1 } }),
    row({ id: "s-critique-x-b", purpose: "critique", metrics: { tokensIn: 20, tokensOut: 2 } }),
  ];
  const out = summarizeActivity(rows);
  const labels = out.byPurpose.map((p) => p.purposeLabel).sort();
  assert.deepEqual(labels, ["critic-a", "critic-b"]);
});

test("absTime formats an ISO timestamp and falls back on garbage", () => {
  assert.equal(absTime("not-a-date"), "—");
  const s = absTime("2026-05-31T10:28:00.000Z");
  assert.ok(s.length > 0 && s !== "—", `expected a formatted date, got ${s}`);
});
