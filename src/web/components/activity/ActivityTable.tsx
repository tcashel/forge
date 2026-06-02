import { useComputed, useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { type TokenBuckets, tokenBuckets } from "../../../core/usage";
import { fetchAgentActivity } from "../../lib/api";
import { activityFilter, activitySelectedId } from "../../signals/ui";
import type { ActivityFilter, AgentActivityRow } from "../../types";

type SortKey = "startedAt" | "duration" | "tokens" | "cost";
type SortDir = "asc" | "desc";

interface SortState {
  key: SortKey;
  dir: SortDir;
}

const REFRESH_MS = 2500;

function deriveLabel(row: AgentActivityRow): string {
  if (row.purpose !== "critique") return row.purpose;
  // s-critique-<critiqueId>-a|b
  if (row.id.endsWith("-a")) return "critic-a";
  if (row.id.endsWith("-b")) return "critic-b";
  return "critique";
}

function formatDuration(row: AgentActivityRow, now: number): string {
  const start = new Date(row.startedAt).getTime();
  const end = row.finishedAt ? new Date(row.finishedAt).getTime() : now;
  if (Number.isNaN(start) || Number.isNaN(end)) return "—";
  const ms = end - start;
  if (ms < 0) return "—";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  const m = Math.floor(ms / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return `${m}m${s.toString().padStart(2, "0")}s`;
}

function formatTokens(row: AgentActivityRow): string {
  if (!hasTokenData(row)) return "—";
  // Total input (uncached + cache) / output, so claude and codex compare
  // like-for-like — claude's bulk lives in cache, which raw tokensIn omits.
  const { totalInput, output } = rowTokens(row);
  return `${totalInput.toLocaleString()} / ${output.toLocaleString()}`;
}

function formatCost(row: AgentActivityRow): string {
  const v = row.metrics.costUsd;
  if (typeof v !== "number") return "—";
  if (v >= 1) return `$${v.toFixed(2)}`;
  if (v >= 0.01) return `$${v.toFixed(3)}`;
  return `$${v.toFixed(4)}`;
}

function relTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms)) return "—";
  if (ms < 60_000) return `${Math.max(1, Math.round(ms / 1000))}s`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m`;
  if (ms < 86_400_000) return `${Math.round(ms / 3_600_000)}h`;
  return `${Math.round(ms / 86_400_000)}d`;
}

/** Absolute local date+time, e.g. "May 31, 10:28 AM". */
export function absTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function applyFilter(rows: AgentActivityRow[], filter: ActivityFilter): AgentActivityRow[] {
  if (filter === "all") return rows;
  if (filter === "live") return rows.filter((r) => r.state === "running");
  if (filter === "failed") return rows.filter((r) => r.state === "failed");
  if (filter.startsWith("agent:")) {
    const agent = filter.slice("agent:".length);
    return rows.filter((r) => r.agentAdapter === agent);
  }
  return rows.filter((r) => r.purpose === filter);
}

function compareNumbersNullsLow(a: number | null | undefined, b: number | null | undefined, dir: SortDir): number {
  const av = typeof a === "number" ? a : null;
  const bv = typeof b === "number" ? b : null;
  if (av === null && bv === null) return 0;
  if (av === null) return dir === "asc" ? -1 : 1;
  if (bv === null) return dir === "asc" ? 1 : -1;
  return dir === "asc" ? av - bv : bv - av;
}

function rowDurationMs(r: AgentActivityRow, now: number): number | null {
  const start = new Date(r.startedAt).getTime();
  const end = r.finishedAt ? new Date(r.finishedAt).getTime() : now;
  if (Number.isNaN(start) || Number.isNaN(end)) return null;
  return Math.max(0, end - start);
}

/** True when the row carries any token metric (input, output, or cache). */
function hasTokenData(r: AgentActivityRow): boolean {
  const m = r.metrics;
  return m.tokensIn != null || m.tokensOut != null || m.cacheRead != null || m.cacheCreate != null;
}

/**
 * Normalized token buckets for a row. Delegates to the shared `tokenBuckets`
 * (src/core/usage.ts) so the Activity view and the Usage dashboard compute the
 * same numbers: `input` is uncached/full-rate, `cached` is cache-read +
 * cache-create, `output` is output; `totalInput` = input + cached.
 */
export function rowTokens(r: AgentActivityRow): TokenBuckets {
  return tokenBuckets(r.metrics);
}

function rowTotalTokens(r: AgentActivityRow): number | null {
  if (!hasTokenData(r)) return null;
  return rowTokens(r).total;
}

export interface ActivitySummaryByModel {
  model: string;
  tokensIn: number;
  cached: number;
  tokensOut: number;
}

export interface ActivitySummaryByPurpose {
  purposeLabel: string;
  tokensIn: number;
  cached: number;
  tokensOut: number;
  costUsd: number;
  runCount: number;
}

export interface ActivitySummary {
  runCount: number;
  tokensIn: number;
  cached: number;
  tokensOut: number;
  costUsd: number;
  byModel: ActivitySummaryByModel[];
  byPurpose: ActivitySummaryByPurpose[];
}

/**
 * Roll up the visible activity rows into the totals strip, the
 * tokens-by-model chart, and the per-purpose breakdown. Token buckets come
 * from `rowTokens`, so cached input counts toward the totals and the rollup
 * is adapter-agnostic (a claude run's millions of cache reads are no longer
 * invisible). Rows with no token data contribute 0 (never NaN); `costUsd`
 * sums only non-null `metrics.costUsd`. The per-purpose map is keyed by
 * `deriveLabel(r)` (not `r.purpose`) so critic-a / critic-b split exactly as
 * the table rows do. Ordering is by total tokens (input + cached + output).
 */
export function summarizeActivity(rows: AgentActivityRow[]): ActivitySummary {
  let tokensIn = 0;
  let cached = 0;
  let tokensOut = 0;
  let costUsd = 0;
  const byModelMap = new Map<string, { tokensIn: number; cached: number; tokensOut: number }>();
  const byPurposeMap = new Map<
    string,
    { tokensIn: number; cached: number; tokensOut: number; costUsd: number; runCount: number }
  >();
  for (const r of rows) {
    const t = rowTokens(r);
    const cost = typeof r.metrics.costUsd === "number" ? r.metrics.costUsd : 0;
    tokensIn += t.input;
    cached += t.cached;
    tokensOut += t.output;
    costUsd += cost;
    if (t.total > 0) {
      const key = r.model ?? "—";
      const acc = byModelMap.get(key) ?? { tokensIn: 0, cached: 0, tokensOut: 0 };
      acc.tokensIn += t.input;
      acc.cached += t.cached;
      acc.tokensOut += t.output;
      byModelMap.set(key, acc);
    }
    const pKey = deriveLabel(r);
    const pAcc = byPurposeMap.get(pKey) ?? { tokensIn: 0, cached: 0, tokensOut: 0, costUsd: 0, runCount: 0 };
    pAcc.tokensIn += t.input;
    pAcc.cached += t.cached;
    pAcc.tokensOut += t.output;
    pAcc.costUsd += cost;
    pAcc.runCount += 1;
    byPurposeMap.set(pKey, pAcc);
  }
  const total = (v: { tokensIn: number; cached: number; tokensOut: number }) => v.tokensIn + v.cached + v.tokensOut;
  const byModel: ActivitySummaryByModel[] = Array.from(byModelMap.entries())
    .map(([model, v]) => ({ model, ...v }))
    .sort((a, b) => total(b) - total(a));
  const byPurpose: ActivitySummaryByPurpose[] = Array.from(byPurposeMap.entries())
    .map(([purposeLabel, v]) => ({ purposeLabel, ...v }))
    .sort((a, b) => total(b) - total(a));
  return { runCount: rows.length, tokensIn, cached, tokensOut, costUsd, byModel, byPurpose };
}

function formatTotalCost(v: number): string {
  if (v <= 0) return "—";
  return `$${v.toFixed(2)}`;
}

function applySort(rows: AgentActivityRow[], sort: SortState): AgentActivityRow[] {
  const sorted = [...rows];
  const now = Date.now();
  switch (sort.key) {
    case "startedAt":
      sorted.sort((a, b) =>
        sort.dir === "asc" ? a.startedAt.localeCompare(b.startedAt) : b.startedAt.localeCompare(a.startedAt),
      );
      break;
    case "duration":
      sorted.sort((a, b) => compareNumbersNullsLow(rowDurationMs(a, now), rowDurationMs(b, now), sort.dir));
      break;
    case "tokens":
      sorted.sort((a, b) => compareNumbersNullsLow(rowTotalTokens(a), rowTotalTokens(b), sort.dir));
      break;
    case "cost":
      sorted.sort((a, b) => compareNumbersNullsLow(a.metrics.costUsd ?? null, b.metrics.costUsd ?? null, sort.dir));
      break;
  }
  return sorted;
}

export function ActivityTable() {
  const rows = useSignal<AgentActivityRow[]>([]);
  const error = useSignal<string | null>(null);
  const tick = useSignal(0);
  const sort = useSignal<SortState>({ key: "startedAt", dir: "desc" });

  // Poll list every REFRESH_MS, plus a separate 5s timer so running rows
  // tick their Duration cell even if the dataset hasn't changed.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const resp = await fetchAgentActivity({ limit: 200 });
        if (cancelled) return;
        rows.value = resp.rows;
        error.value = null;
      } catch (e) {
        if (cancelled) return;
        error.value = e instanceof Error ? e.message : String(e);
      }
    };
    void load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      tick.value = tick.value + 1;
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const filteredSorted = useComputed(() => {
    const filtered = applyFilter(rows.value, activityFilter.value);
    return applySort(filtered, sort.value);
  });

  const summary = useComputed(() => summarizeActivity(filteredSorted.value));

  const toggleSort = (key: SortKey) => {
    if (sort.value.key === key) {
      sort.value = { key, dir: sort.value.dir === "asc" ? "desc" : "asc" };
    } else {
      sort.value = { key, dir: "desc" };
    }
  };

  const _t = tick.value; // tracking dep so re-render on tick
  void _t;
  const now = Date.now();

  return (
    <div class="activity-table">
      {error.value ? <div class="activity-error">{error.value}</div> : null}
      <ActivitySummaryStrip summary={summary.value} />
      <table>
        <thead>
          <tr>
            <th>Status</th>
            <th>Purpose</th>
            <th>Agent</th>
            <th>Model</th>
            <th>Spec</th>
            <th>
              <button type="button" class="sort-btn" onClick={() => toggleSort("startedAt")}>
                Started {sort.value.key === "startedAt" ? (sort.value.dir === "asc" ? "↑" : "↓") : ""}
              </button>
            </th>
            <th>
              <button type="button" class="sort-btn" onClick={() => toggleSort("duration")}>
                Duration {sort.value.key === "duration" ? (sort.value.dir === "asc" ? "↑" : "↓") : ""}
              </button>
            </th>
            <th>
              <button type="button" class="sort-btn" onClick={() => toggleSort("tokens")}>
                Tokens {sort.value.key === "tokens" ? (sort.value.dir === "asc" ? "↑" : "↓") : ""}
              </button>
            </th>
            <th>
              <button type="button" class="sort-btn" onClick={() => toggleSort("cost")}>
                Cost {sort.value.key === "cost" ? (sort.value.dir === "asc" ? "↑" : "↓") : ""}
              </button>
            </th>
            <th>Branch / PR</th>
          </tr>
        </thead>
        <tbody>
          {filteredSorted.value.length === 0 ? (
            <tr>
              <td colSpan={10} class="activity-empty">
                No activity matches the current filter.
              </td>
            </tr>
          ) : null}
          {filteredSorted.value.map((row) => {
            const selected = activitySelectedId.value === row.id;
            return (
              <tr
                key={row.id}
                class={`activity-row state-${row.state}${selected ? " selected" : ""}`}
                onClick={() => {
                  activitySelectedId.value = row.id;
                }}
              >
                <td>
                  <span class={`activity-status activity-state-${row.state}`}>{row.state}</span>
                </td>
                <td>{deriveLabel(row)}</td>
                <td>{row.agentAdapter}</td>
                <td>{row.model ?? "—"}</td>
                <td>{row.plan ? row.plan.title : row.metrics.scopeKind === "draft" ? row.relatedId : "—"}</td>
                <td title={relTime(row.startedAt)}>{absTime(row.startedAt)}</td>
                <td>{formatDuration(row, now)}</td>
                <td
                  title={`total input / output — uncached ${row.metrics.tokensIn ?? "—"}, cache read ${row.metrics.cacheRead ?? "—"}, cache create ${row.metrics.cacheCreate ?? "—"}, output ${row.metrics.tokensOut ?? "—"}`}
                >
                  {formatTokens(row)}
                </td>
                <td>{formatCost(row)}</td>
                <td>{row.branchName ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ActivitySummaryStrip({ summary }: { summary: ActivitySummary }) {
  return (
    <div class="activity-summary">
      <div class="activity-summary-totals">
        <div class="activity-summary-stat">
          <span class="activity-summary-label">Runs</span>
          <span class="activity-summary-value">{summary.runCount.toLocaleString()}</span>
        </div>
        <div class="activity-summary-stat">
          <span class="activity-summary-label">Input (uncached)</span>
          <span class="activity-summary-value">{summary.tokensIn.toLocaleString()}</span>
        </div>
        <div class="activity-summary-stat">
          <span class="activity-summary-label">Cached</span>
          <span class="activity-summary-value">{summary.cached.toLocaleString()}</span>
        </div>
        <div class="activity-summary-stat">
          <span class="activity-summary-label">Tokens out</span>
          <span class="activity-summary-value">{summary.tokensOut.toLocaleString()}</span>
        </div>
        <div class="activity-summary-stat">
          <span class="activity-summary-label">Cost</span>
          <span class="activity-summary-value">{formatTotalCost(summary.costUsd)}</span>
        </div>
      </div>
      <ActivityByModelChart byModel={summary.byModel} />
      <ActivityByPurposeBreakdown byPurpose={summary.byPurpose} />
    </div>
  );
}

function ActivityByPurposeBreakdown({ byPurpose }: { byPurpose: ActivitySummaryByPurpose[] }) {
  const withTokens = byPurpose.filter((p) => p.tokensIn + p.cached + p.tokensOut > 0);
  if (withTokens.length === 0) {
    return <div class="activity-summary-purpose-empty">No token data in the current filter.</div>;
  }
  return (
    <table class="activity-summary-purpose">
      <thead>
        <tr>
          <th>Purpose</th>
          <th>Input</th>
          <th>Cached</th>
          <th>Output</th>
          <th>Cost</th>
        </tr>
      </thead>
      <tbody>
        {withTokens.map((p) => (
          <tr key={p.purposeLabel}>
            <td class="activity-summary-purpose-label">{p.purposeLabel}</td>
            <td>{p.tokensIn.toLocaleString()}</td>
            <td>{p.cached.toLocaleString()}</td>
            <td>{p.tokensOut.toLocaleString()}</td>
            <td>{formatTotalCost(p.costUsd)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ActivityByModelChart({ byModel }: { byModel: ActivitySummaryByModel[] }) {
  const max = byModel.reduce((m, r) => Math.max(m, r.tokensIn + r.cached + r.tokensOut), 0);
  if (byModel.length === 0 || max === 0) {
    return <div class="activity-summary-chart-empty">No token data in the current filter.</div>;
  }
  return (
    <div class="activity-summary-chart">
      {byModel.map((row) => {
        const total = row.tokensIn + row.cached + row.tokensOut;
        const width = Math.max(2, Math.round((total / max) * 100));
        const breakdown = `${row.model} — input ${row.tokensIn.toLocaleString()}, cached ${row.cached.toLocaleString()}, output ${row.tokensOut.toLocaleString()}`;
        return (
          <div class="activity-summary-bar-row" key={row.model} title={breakdown}>
            <span class="activity-summary-bar-label" title={row.model}>
              {row.model}
            </span>
            <span class="activity-summary-bar-track">
              <span class="activity-summary-bar-fill" style={{ width: `${width}%` }} />
            </span>
            <span class="activity-summary-bar-value">{total.toLocaleString()}</span>
          </div>
        );
      })}
    </div>
  );
}
