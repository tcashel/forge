import * as assert from "node:assert/strict";
import { test } from "node:test";
import { aggregateUsage, tokenBuckets, type UsageRow } from "../src/core/usage.ts";

let rowSeq = 0;
function row(o: Partial<UsageRow> & { startedAt: string }): UsageRow {
  return {
    id: `s-exec-${rowSeq++}`,
    purpose: "execution",
    agentAdapter: "claude",
    model: "claude-opus-4-7",
    state: "completed",
    metrics: {},
    plan: null,
    ...o,
  };
}

test("tokenBuckets normalizes buckets and totals", () => {
  const t = tokenBuckets({ tokensIn: 100, cacheRead: 5000, cacheCreate: 200, tokensOut: 80 });
  assert.equal(t.input, 100);
  assert.equal(t.cacheRead, 5000);
  assert.equal(t.cacheCreate, 200);
  assert.equal(t.cached, 5200);
  assert.equal(t.totalInput, 5300);
  assert.equal(t.total, 5380);
});

test("tokenBuckets treats missing/invalid metrics as 0", () => {
  const t = tokenBuckets({ tokensIn: null, tokensOut: undefined });
  assert.equal(t.total, 0);
  assert.equal(tokenBuckets(undefined).total, 0);
});

test("aggregateUsage totals sum cost/tokens and split provider vs estimate", () => {
  const rows = [
    row({
      startedAt: "2026-06-01T10:00:00Z",
      metrics: { tokensIn: 100, tokensOut: 50, costUsd: 1, costSource: "provider" },
    }),
    row({
      startedAt: "2026-06-01T11:00:00Z",
      agentAdapter: "codex",
      model: "gpt-5.5",
      metrics: { tokensIn: 200, cacheRead: 300, tokensOut: 20, costUsd: 0.5, costSource: "estimate" },
    }),
    row({ startedAt: "2026-06-02T10:00:00Z", state: "failed", metrics: { tokensIn: 10, tokensOut: 5, costUsd: null } }),
  ];
  const s = aggregateUsage(rows, { since: "2026-06-01T00:00:00Z", until: "2026-06-03T00:00:00Z" });
  assert.equal(s.totals.runCount, 3);
  assert.equal(s.totals.tokensIn, 310);
  assert.equal(s.totals.cached, 300);
  assert.equal(s.totals.tokensOut, 75);
  assert.ok(Math.abs(s.totals.costUsd - 1.5) < 1e-9);
  assert.ok(Math.abs(s.totals.providerCostUsd - 1) < 1e-9);
  assert.ok(Math.abs(s.totals.estimateCostUsd - 0.5) < 1e-9);
  assert.equal(s.totals.successCount, 2);
  assert.equal(s.totals.failCount, 1);
  assert.ok(Math.abs(s.totals.avgCostPerRun - 0.5) < 1e-9);
});

test("aggregateUsage dense-fills the daily trend across the window", () => {
  const rows = [
    row({ startedAt: "2026-06-01T10:00:00Z", metrics: { costUsd: 2 } }),
    row({ startedAt: "2026-06-03T10:00:00Z", metrics: { costUsd: 4 } }),
  ];
  const s = aggregateUsage(rows, { since: "2026-06-01T00:00:00Z", until: "2026-06-03T23:59:59Z" });
  assert.deepEqual(
    s.trend.map((p) => p.date),
    ["2026-06-01", "2026-06-02", "2026-06-03"],
  );
  assert.equal(s.trend[0].costUsd, 2);
  assert.equal(s.trend[1].costUsd, 0); // empty day filled
  assert.equal(s.trend[1].runCount, 0);
  assert.equal(s.trend[2].costUsd, 4);
});

test("aggregateUsage breakdowns group and sort by cost desc", () => {
  const rows = [
    row({ startedAt: "2026-06-01T10:00:00Z", model: "opus", purpose: "execution", metrics: { costUsd: 1 } }),
    row({ startedAt: "2026-06-01T11:00:00Z", model: "opus", purpose: "review", metrics: { costUsd: 5 } }),
    row({ startedAt: "2026-06-01T12:00:00Z", model: "sonnet", purpose: "execution", metrics: { costUsd: 2 } }),
  ];
  const s = aggregateUsage(rows);
  assert.equal(s.byModel[0].key, "opus");
  assert.ok(Math.abs(s.byModel[0].costUsd - 6) < 1e-9);
  assert.equal(s.byModel[1].key, "sonnet");
  assert.equal(s.byPurpose[0].key, "review"); // 5 > execution's 3
  assert.equal(s.byAgent[0].key, "claude");
});

test("aggregateUsage groups by spec and labels unlinked rows", () => {
  const rows = [
    row({
      startedAt: "2026-06-01T10:00:00Z",
      plan: { id: "p1", title: "Spec One", repo: "/r/a" },
      metrics: { costUsd: 3 },
    }),
    row({
      startedAt: "2026-06-01T11:00:00Z",
      plan: { id: "p1", title: "Spec One", repo: "/r/a" },
      metrics: { costUsd: 1 },
    }),
    row({ startedAt: "2026-06-01T12:00:00Z", plan: null, metrics: { costUsd: 2 } }),
  ];
  const s = aggregateUsage(rows);
  const top = s.bySpec[0];
  assert.equal(top.key, "p1");
  assert.equal(top.label, "Spec One");
  assert.equal(top.runCount, 2);
  assert.ok(Math.abs(top.costUsd - 4) < 1e-9);
  const none = s.bySpec.find((b) => b.key.startsWith("__"));
  assert.ok(none, "unlinked rows form a (no spec) bucket");
  assert.equal(none?.label, "(no spec)");
});

test("aggregateUsage applies fine filters but options reflect the full window", () => {
  const rows = [
    row({
      startedAt: "2026-06-01T10:00:00Z",
      model: "opus",
      plan: { id: "p1", title: "One", repo: "/r/a" },
      metrics: { costUsd: 1 },
    }),
    row({
      startedAt: "2026-06-01T11:00:00Z",
      model: "gpt-5.5",
      agentAdapter: "codex",
      plan: { id: "p2", title: "Two", repo: "/r/b" },
      metrics: { costUsd: 9 },
    }),
  ];
  const s = aggregateUsage(rows, { spec: "p1" });
  // totals reflect only the filtered spec
  assert.equal(s.totals.runCount, 1);
  assert.ok(Math.abs(s.totals.costUsd - 1) < 1e-9);
  // options still list both specs/models/agents present in the window
  assert.deepEqual(s.options.specs.map((x) => x.id).sort(), ["p1", "p2"]);
  assert.deepEqual(s.options.models, ["gpt-5.5", "opus"]);
  assert.deepEqual(s.options.agents, ["claude", "codex"]);
  assert.deepEqual(s.options.repos, ["/r/a", "/r/b"]);
});

test("aggregateUsage handles an empty row set without NaN", () => {
  const s = aggregateUsage([], { since: "2026-06-01T00:00:00Z", until: "2026-06-02T00:00:00Z" });
  assert.equal(s.totals.runCount, 0);
  assert.equal(s.totals.costUsd, 0);
  assert.equal(s.totals.avgCostPerRun, 0);
  assert.deepEqual(s.bySpec, []);
  assert.equal(s.trend.length, 2); // still dense-filled across the window
});

// ─── cost-to-ship / rework lens ─────────────────────────────────────────────────

test("aggregateUsage classifies spec outcomes from the outcomes map", () => {
  const rows = [
    row({
      startedAt: "2026-06-01T10:00:00Z",
      plan: { id: "shipDone", title: "Done", repo: "/r" },
      metrics: { costUsd: 1 },
    }),
    row({
      startedAt: "2026-06-01T10:00:00Z",
      plan: { id: "shipPr", title: "PR", repo: "/r" },
      metrics: { costUsd: 1 },
    }),
    row({
      startedAt: "2026-06-01T10:00:00Z",
      plan: { id: "fail", title: "Fail", repo: "/r" },
      metrics: { costUsd: 1 },
    }),
    row({
      startedAt: "2026-06-01T10:00:00Z",
      plan: { id: "gone", title: "Gone", repo: "/r" },
      metrics: { costUsd: 1 },
    }),
    row({
      startedAt: "2026-06-01T10:00:00Z",
      plan: { id: "live", title: "Live", repo: "/r" },
      metrics: { costUsd: 1 },
    }),
  ];
  const outcomes = {
    shipDone: { status: "done", prNumber: null },
    shipPr: { status: "running", prNumber: 42 },
    fail: { status: "quality_failed", prNumber: null },
    gone: { status: "archived", prNumber: null },
    live: { status: "running", prNumber: null },
  };
  const s = aggregateUsage(rows, {}, outcomes);
  const byId = new Map(s.bySpecDetail.map((d) => [d.planId, d.outcome]));
  assert.equal(byId.get("shipDone"), "shipped");
  assert.equal(byId.get("shipPr"), "shipped");
  assert.equal(byId.get("fail"), "failed");
  assert.equal(byId.get("gone"), "abandoned");
  assert.equal(byId.get("live"), "active");
  assert.equal(s.totals.shippedSpecCount, 2);
});

test("aggregateUsage decomposes per-spec cost: purpose split, fixRounds, reworkRatio", () => {
  const rows = [
    row({
      id: "s-exec-jX-r1",
      startedAt: "2026-06-01T09:00:00Z",
      purpose: "execution",
      plan: { id: "p", title: "Spec", repo: "/r" },
      metrics: { costUsd: 6 },
    }),
    row({
      id: "s-review-jX-r1",
      startedAt: "2026-06-01T10:00:00Z",
      purpose: "review",
      plan: { id: "p", title: "Spec", repo: "/r" },
      metrics: { costUsd: 1 },
    }),
    row({
      id: "s-fix-jX-r1",
      startedAt: "2026-06-01T11:00:00Z",
      purpose: "fix",
      plan: { id: "p", title: "Spec", repo: "/r" },
      metrics: { costUsd: 2 },
    }),
    row({
      id: "s-review-jX-r2",
      startedAt: "2026-06-01T12:00:00Z",
      purpose: "review",
      plan: { id: "p", title: "Spec", repo: "/r" },
      metrics: { costUsd: 1 },
    }),
  ];
  const s = aggregateUsage(rows, {}, { p: { status: "done", prNumber: null } });
  const d = s.bySpecDetail.find((x) => x.planId === "p");
  assert.ok(d);
  if (!d) return;
  assert.ok(Math.abs(d.total - 10) < 1e-9);
  assert.ok(Math.abs(d.execution - 6) < 1e-9);
  assert.ok(Math.abs(d.review - 2) < 1e-9); // both review rounds
  assert.ok(Math.abs(d.fix - 2) < 1e-9);
  assert.equal(d.fixRounds, 1); // one distinct fix session
  // reworkCost = fix (2) + review round 2 (1); round-1 review excluded.
  assert.ok(Math.abs(d.reworkCost - 3) < 1e-9);
  assert.ok(Math.abs(d.reworkRatio - 0.3) < 1e-9);
});

test("aggregateUsage cost-to-ship totals: costPerShippedSpec, wastedSpend = rework + failed", () => {
  const rows = [
    // Shipped spec with rework (fix + r2 review).
    row({
      id: "s-exec-a-r1",
      startedAt: "2026-06-01T09:00:00Z",
      purpose: "execution",
      plan: { id: "a", title: "A", repo: "/r" },
      metrics: { costUsd: 10 },
    }),
    row({
      id: "s-review-a-r1",
      startedAt: "2026-06-01T10:00:00Z",
      purpose: "review",
      plan: { id: "a", title: "A", repo: "/r" },
      metrics: { costUsd: 1 },
    }),
    row({
      id: "s-review-a-r2",
      startedAt: "2026-06-01T11:00:00Z",
      purpose: "review",
      plan: { id: "a", title: "A", repo: "/r" },
      metrics: { costUsd: 1 },
    }),
    row({
      id: "s-fix-a-r1",
      startedAt: "2026-06-01T12:00:00Z",
      purpose: "fix",
      plan: { id: "a", title: "A", repo: "/r" },
      metrics: { costUsd: 3 },
    }),
    // Failed spec — all its spend is wasted.
    row({
      id: "s-exec-b-r1",
      startedAt: "2026-06-01T09:00:00Z",
      purpose: "execution",
      plan: { id: "b", title: "B", repo: "/r" },
      metrics: { costUsd: 5 },
    }),
    // No-plan row — counted in flat totals, excluded from spec math.
    row({ startedAt: "2026-06-01T09:00:00Z", metrics: { costUsd: 100 } }),
  ];
  const outcomes = {
    a: { status: "done", prNumber: null },
    b: { status: "failed", prNumber: null },
  };
  const s = aggregateUsage(rows, {}, outcomes);
  assert.equal(s.totals.shippedSpecCount, 1);
  // reworkCost on a = fix (3) + review r2 (1) = 4.
  assert.ok(Math.abs(s.totals.reworkCostUsd - 4) < 1e-9);
  // failedSpendUsd = total of failed spec b = 5.
  assert.ok(Math.abs(s.totals.failedSpendUsd - 5) < 1e-9);
  assert.ok(Math.abs(s.totals.wastedSpendUsd - 9) < 1e-9); // 4 + 5
  // costPerShippedSpec = totals.costUsd / 1. totals.costUsd includes no-plan row.
  assert.ok(Math.abs(s.totals.costUsd - 120) < 1e-9);
  assert.ok(Math.abs(s.totals.costPerShippedSpec - 120) < 1e-9);
});

test("aggregateUsage cost-to-ship totals are 0-guarded with no shipped specs", () => {
  const rows = [row({ startedAt: "2026-06-01T09:00:00Z", metrics: { costUsd: 5 } })];
  const s = aggregateUsage(rows, {}, {});
  assert.equal(s.totals.shippedSpecCount, 0);
  assert.equal(s.totals.costPerShippedSpec, 0);
  assert.equal(s.totals.wastedSpendUsd, 0);
  assert.deepEqual(s.bySpecDetail, []);
});
