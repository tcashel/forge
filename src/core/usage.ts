/**
 * Usage & Cost aggregation — pure, DB-free rollups for the Usage dashboard.
 *
 * `aggregateUsage` takes the already-projected agent-activity rows (the same
 * shape serve.ts builds for /api/agent-activity, including resolved `plan`) and
 * a filter set, and returns totals, a daily cost/token trend, and per-spec /
 * per-model / per-agent / per-purpose breakdowns plus the distinct filter
 * options present in the window. All token math goes through `tokenBuckets`,
 * which is also the single source of truth for the web table's `rowTokens` so
 * the dashboard and Activity view never diverge.
 *
 * Token semantics (post Phase-1 normalization, identical across adapters):
 *   input = uncached/full-rate · cacheRead/cacheCreate = cache · output = output.
 */

export interface UsageMetrics {
  tokensIn?: number | null;
  tokensOut?: number | null;
  cacheRead?: number | null;
  cacheCreate?: number | null;
  costUsd?: number | null;
  costSource?: "provider" | "estimate" | null;
}

export interface TokenBuckets {
  /** Uncached/full-rate input. */
  input: number;
  cacheRead: number;
  cacheCreate: number;
  /** cacheRead + cacheCreate. */
  cached: number;
  output: number;
  /** input + cached. */
  totalInput: number;
  /** totalInput + output. */
  total: number;
}

function n(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

/** Normalized token buckets for one row's metrics. Missing fields count as 0. */
export function tokenBuckets(m: UsageMetrics | null | undefined): TokenBuckets {
  const input = n(m?.tokensIn);
  const cacheRead = n(m?.cacheRead);
  const cacheCreate = n(m?.cacheCreate);
  const output = n(m?.tokensOut);
  const cached = cacheRead + cacheCreate;
  const totalInput = input + cached;
  return { input, cacheRead, cacheCreate, cached, output, totalInput, total: totalInput + output };
}

/** Minimal row shape the aggregator needs (a superset is fine). */
export interface UsageRow {
  /** Deterministic session id, e.g. `s-review-<jobId>-rN` / `s-fix-<jobId>-rN`. */
  id: string;
  purpose: string;
  agentAdapter: string;
  model: string | null;
  state: string;
  startedAt: string;
  metrics: UsageMetrics;
  plan: { id: string; title: string; repo: string | null } | null;
}

/** Authoritative spec outcome, sourced from the JSON plan store. */
export interface SpecOutcomeRef {
  status: string;
  prNumber: number | null;
}

/** plan.id → outcome ref. Passed in by the endpoint from `store.getPlans()`. */
export type OutcomesMap = Record<string, SpecOutcomeRef>;

export type SpecOutcome = "shipped" | "failed" | "abandoned" | "active";

/** Per-spec cost decomposition + rework lens. */
export interface SpecCost {
  planId: string;
  title: string;
  repo: string | null;
  outcome: SpecOutcome;
  total: number;
  execution: number;
  review: number;
  fix: number;
  critique: number;
  other: number;
  /** Count of distinct `fix` sessions for the spec. */
  fixRounds: number;
  /** All fix cost + review cost for review rounds ≥ 2. */
  reworkCost: number;
  /** reworkCost / total (0 when total is 0). */
  reworkRatio: number;
}

export interface UsageFilters {
  /** plan.repo path. */
  repo?: string | null;
  /** plan.id (a "spec"). */
  spec?: string | null;
  model?: string | null;
  agent?: string | null;
  purpose?: string | null;
  state?: string | null;
  /** Window bounds (ISO). Used to dense-fill the trend across empty days. */
  since?: string | null;
  until?: string | null;
}

export interface UsageBucket {
  key: string;
  label: string;
  costUsd: number;
  tokensIn: number;
  cached: number;
  tokensOut: number;
  runCount: number;
}

export interface UsageTrendPoint {
  date: string; // YYYY-MM-DD
  costUsd: number;
  tokensIn: number;
  cached: number;
  tokensOut: number;
  runCount: number;
}

export interface UsageTotals {
  runCount: number;
  tokensIn: number;
  cached: number;
  tokensOut: number;
  costUsd: number;
  successCount: number;
  failCount: number;
  avgCostPerRun: number;
  providerCostUsd: number;
  estimateCostUsd: number;
  /** Specs classified shipped (status==="done" || prNumber != null). */
  shippedSpecCount: number;
  /** costUsd / shippedSpecCount (0-guarded). */
  costPerShippedSpec: number;
  /** Σ reworkCost across linked specs (fix + review rounds ≥ 2). */
  reworkCostUsd: number;
  /** Σ total of failed + abandoned specs. */
  failedSpendUsd: number;
  /** reworkCostUsd + failedSpendUsd. */
  wastedSpendUsd: number;
}

export interface UsageOptions {
  repos: string[];
  specs: Array<{ id: string; title: string }>;
  models: string[];
  agents: string[];
  purposes: string[];
}

export interface UsageSummary {
  window: { since: string | null; until: string | null };
  totals: UsageTotals;
  trend: UsageTrendPoint[];
  bySpec: UsageBucket[];
  bySpecDetail: SpecCost[];
  byModel: UsageBucket[];
  byAgent: UsageBucket[];
  byPurpose: UsageBucket[];
  options: UsageOptions;
}

const NO_SPEC_KEY = "__none__";

function dayOf(iso: string): string {
  return iso.slice(0, 10);
}

/** Inclusive list of YYYY-MM-DD strings from start to end. Empty if invalid. */
function dateRange(startDay: string, endDay: string): string[] {
  const start = new Date(`${startDay}T00:00:00Z`);
  const end = new Date(`${endDay}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return [];
  const out: string[] = [];
  const cur = new Date(start);
  // Cap at a sane horizon so a malformed window can't loop forever.
  for (let i = 0; i < 1000 && cur <= end; i++) {
    out.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}

interface Acc {
  costUsd: number;
  tokensIn: number;
  cached: number;
  tokensOut: number;
  runCount: number;
}

function emptyAcc(): Acc {
  return { costUsd: 0, tokensIn: 0, cached: 0, tokensOut: 0, runCount: 0 };
}

function addRow(acc: Acc, row: UsageRow): void {
  const t = tokenBuckets(row.metrics);
  acc.tokensIn += t.input;
  acc.cached += t.cached;
  acc.tokensOut += t.output;
  acc.costUsd += n(row.metrics?.costUsd);
  acc.runCount += 1;
}

function toBucket(key: string, label: string, acc: Acc): UsageBucket {
  return {
    key,
    label,
    costUsd: acc.costUsd,
    tokensIn: acc.tokensIn,
    cached: acc.cached,
    tokensOut: acc.tokensOut,
    runCount: acc.runCount,
  };
}

/** Sort buckets by cost desc, then total tokens desc, then label asc. */
function sortBuckets(buckets: UsageBucket[]): UsageBucket[] {
  return buckets.sort((a, b) => {
    if (b.costUsd !== a.costUsd) return b.costUsd - a.costUsd;
    const at = a.tokensIn + a.cached + a.tokensOut;
    const bt = b.tokensIn + b.cached + b.tokensOut;
    if (bt !== at) return bt - at;
    return a.label.localeCompare(b.label);
  });
}

function groupBy(rows: UsageRow[], keyOf: (r: UsageRow) => { key: string; label: string }): UsageBucket[] {
  const map = new Map<string, { label: string; acc: Acc }>();
  for (const r of rows) {
    const { key, label } = keyOf(r);
    const entry = map.get(key) ?? { label, acc: emptyAcc() };
    addRow(entry.acc, r);
    map.set(key, entry);
  }
  return sortBuckets(Array.from(map.entries()).map(([key, v]) => toBucket(key, v.label, v.acc)));
}

/** Classify a spec's outcome from its plan-store ref (or null when unknown). */
function classifyOutcome(ref: SpecOutcomeRef | undefined): SpecOutcome {
  if (!ref) return "active";
  if (ref.status === "done" || ref.prNumber != null) return "shipped";
  if (ref.status === "failed" || ref.status === "quality_failed") return "failed";
  if (ref.status === "archived") return "abandoned";
  return "active";
}

/**
 * Parse the trailing `-rN` round number from a session id (e.g.
 * `s-review-jX-r2` → 2). Returns null when no round suffix is present.
 */
function roundOf(id: string): number | null {
  const m = id.match(/-r(\d+)$/);
  return m ? Number.parseInt(m[1], 10) : null;
}

interface SpecAcc {
  title: string;
  repo: string | null;
  total: number;
  execution: number;
  review: number;
  fix: number;
  critique: number;
  other: number;
  fixSessions: Set<string>;
  reworkCost: number;
}

/**
 * Per-spec cost decomposition. Rows without a `plan` are excluded from
 * spec-level outcome math (they still count in the flat totals). `reworkCost`
 * is all `fix` cost plus `review` cost for re-review rounds (≥ 2).
 */
function buildSpecDetail(rows: UsageRow[], outcomes: OutcomesMap): SpecCost[] {
  const map = new Map<string, SpecAcc>();
  for (const r of rows) {
    if (!r.plan) continue;
    const acc = map.get(r.plan.id) ?? {
      title: r.plan.title,
      repo: r.plan.repo,
      total: 0,
      execution: 0,
      review: 0,
      fix: 0,
      critique: 0,
      other: 0,
      fixSessions: new Set<string>(),
      reworkCost: 0,
    };
    const cost = n(r.metrics?.costUsd);
    acc.total += cost;
    switch (r.purpose) {
      case "execution":
        acc.execution += cost;
        break;
      case "review":
        acc.review += cost;
        // Round 1 is the baseline review; rounds ≥ 2 are re-reviews (rework).
        if ((roundOf(r.id) ?? 1) >= 2) acc.reworkCost += cost;
        break;
      case "fix":
        acc.fix += cost;
        acc.fixSessions.add(r.id);
        acc.reworkCost += cost;
        break;
      case "critique":
        acc.critique += cost;
        break;
      default:
        acc.other += cost;
        break;
    }
    map.set(r.plan.id, acc);
  }

  const detail: SpecCost[] = Array.from(map.entries()).map(([planId, a]) => ({
    planId,
    title: a.title,
    repo: a.repo,
    outcome: classifyOutcome(outcomes[planId]),
    total: a.total,
    execution: a.execution,
    review: a.review,
    fix: a.fix,
    critique: a.critique,
    other: a.other,
    fixRounds: a.fixSessions.size,
    reworkCost: a.reworkCost,
    reworkRatio: a.total > 0 ? a.reworkCost / a.total : 0,
  }));
  detail.sort((x, y) => y.total - x.total || x.title.localeCompare(y.title));
  return detail;
}

/**
 * Roll up usage rows. `options` is computed from the full (time-windowed) input
 * so the filter controls stay populated; totals/trend/breakdowns reflect the
 * rows that survive the cross-filters (repo/spec/model/agent/purpose/state).
 *
 * `outcomes` (optional) maps plan.id → {status, prNumber} from the JSON plan
 * store; when supplied it drives the per-spec outcome classification and the
 * cost-to-ship totals. Callers may omit it (the spec lens degrades to "active").
 */
export function aggregateUsage(rows: UsageRow[], filters: UsageFilters = {}, outcomes: OutcomesMap = {}): UsageSummary {
  // Distinct option lists from the unfiltered (time-windowed) set.
  const repos = new Set<string>();
  const specs = new Map<string, string>();
  const models = new Set<string>();
  const agents = new Set<string>();
  const purposes = new Set<string>();
  for (const r of rows) {
    if (r.plan?.repo) repos.add(r.plan.repo);
    if (r.plan) specs.set(r.plan.id, r.plan.title);
    if (r.model) models.add(r.model);
    if (r.agentAdapter) agents.add(r.agentAdapter);
    if (r.purpose) purposes.add(r.purpose);
  }

  const filtered = rows.filter((r) => {
    if (filters.repo && r.plan?.repo !== filters.repo) return false;
    if (filters.spec && r.plan?.id !== filters.spec) return false;
    if (filters.model && r.model !== filters.model) return false;
    if (filters.agent && r.agentAdapter !== filters.agent) return false;
    if (filters.purpose && r.purpose !== filters.purpose) return false;
    if (filters.state && r.state !== filters.state) return false;
    return true;
  });

  // Totals.
  const totalsAcc = emptyAcc();
  let successCount = 0;
  let failCount = 0;
  let providerCostUsd = 0;
  let estimateCostUsd = 0;
  for (const r of filtered) {
    addRow(totalsAcc, r);
    if (r.state === "completed") successCount += 1;
    else if (r.state === "failed") failCount += 1;
    const cost = n(r.metrics?.costUsd);
    if (r.metrics?.costSource === "provider") providerCostUsd += cost;
    else if (r.metrics?.costSource === "estimate") estimateCostUsd += cost;
  }
  // Per-spec decomposition + the cost-to-ship totals derived from it so the
  // numbers reconcile against the spec rows (no-plan rows are excluded here).
  const bySpecDetail = buildSpecDetail(filtered, outcomes);
  let shippedSpecCount = 0;
  let reworkCostUsd = 0;
  let failedSpendUsd = 0;
  for (const s of bySpecDetail) {
    if (s.outcome === "shipped") shippedSpecCount += 1;
    if (s.outcome === "failed" || s.outcome === "abandoned") {
      // The whole spec is wasted spend; its rework is already inside s.total, so
      // don't also add it to reworkCostUsd (that would double-count it in
      // wastedSpendUsd). Rework is only tracked for specs that delivered value.
      failedSpendUsd += s.total;
    } else {
      reworkCostUsd += s.reworkCost;
    }
  }
  const wastedSpendUsd = reworkCostUsd + failedSpendUsd;

  const totals: UsageTotals = {
    runCount: totalsAcc.runCount,
    tokensIn: totalsAcc.tokensIn,
    cached: totalsAcc.cached,
    tokensOut: totalsAcc.tokensOut,
    costUsd: totalsAcc.costUsd,
    successCount,
    failCount,
    avgCostPerRun: totalsAcc.runCount > 0 ? totalsAcc.costUsd / totalsAcc.runCount : 0,
    providerCostUsd,
    estimateCostUsd,
    shippedSpecCount,
    costPerShippedSpec: shippedSpecCount > 0 ? totalsAcc.costUsd / shippedSpecCount : 0,
    reworkCostUsd,
    failedSpendUsd,
    wastedSpendUsd,
  };

  // Daily trend, dense-filled across the window.
  const byDay = new Map<string, Acc>();
  let minDay: string | null = null;
  let maxDay: string | null = null;
  for (const r of filtered) {
    const day = dayOf(r.startedAt);
    if (!day) continue;
    const acc = byDay.get(day) ?? emptyAcc();
    addRow(acc, r);
    byDay.set(day, acc);
    if (minDay === null || day < minDay) minDay = day;
    if (maxDay === null || day > maxDay) maxDay = day;
  }
  const startDay = filters.since ? dayOf(filters.since) : minDay;
  const endDay = filters.until ? dayOf(filters.until) : maxDay;
  const days = startDay && endDay ? dateRange(startDay, endDay) : Array.from(byDay.keys()).sort();
  const trend: UsageTrendPoint[] = days.map((date) => {
    const acc = byDay.get(date) ?? emptyAcc();
    return {
      date,
      costUsd: acc.costUsd,
      tokensIn: acc.tokensIn,
      cached: acc.cached,
      tokensOut: acc.tokensOut,
      runCount: acc.runCount,
    };
  });

  const bySpec = groupBy(filtered, (r) =>
    r.plan ? { key: r.plan.id, label: r.plan.title } : { key: NO_SPEC_KEY, label: "(no spec)" },
  );
  const byModel = groupBy(filtered, (r) => ({ key: r.model ?? "—", label: r.model ?? "—" }));
  const byAgent = groupBy(filtered, (r) => ({ key: r.agentAdapter, label: r.agentAdapter }));
  const byPurpose = groupBy(filtered, (r) => ({ key: r.purpose, label: r.purpose }));

  return {
    window: { since: filters.since ?? null, until: filters.until ?? null },
    totals,
    trend,
    bySpec,
    bySpecDetail,
    byModel,
    byAgent,
    byPurpose,
    options: {
      repos: Array.from(repos).sort(),
      specs: Array.from(specs.entries())
        .map(([id, title]) => ({ id, title }))
        .sort((a, b) => a.title.localeCompare(b.title)),
      models: Array.from(models).sort(),
      agents: Array.from(agents).sort(),
      purposes: Array.from(purposes).sort(),
    },
  };
}
