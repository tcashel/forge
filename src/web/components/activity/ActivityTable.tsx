import { useComputed, useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
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
  const { tokensIn, tokensOut } = row.metrics;
  if (tokensIn == null && tokensOut == null) return "—";
  const a = tokensIn ?? 0;
  const b = tokensOut ?? 0;
  return `${a.toLocaleString()} / ${b.toLocaleString()}`;
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

function rowTotalTokens(r: AgentActivityRow): number | null {
  const { tokensIn, tokensOut } = r.metrics;
  if (tokensIn == null && tokensOut == null) return null;
  return (tokensIn ?? 0) + (tokensOut ?? 0);
}

export interface ActivitySummaryByModel {
  model: string;
  tokensIn: number;
  tokensOut: number;
}

export interface ActivitySummary {
  runCount: number;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
  byModel: ActivitySummaryByModel[];
}

/**
 * Roll up the visible activity rows into the totals strip and the
 * tokens-by-model chart. Null/undefined metric values are treated as 0
 * (a row with no token data contributes nothing) so the strip never
 * renders NaN. `costUsd` sums only non-null `metrics.costUsd`.
 */
export function summarizeActivity(rows: AgentActivityRow[]): ActivitySummary {
  let tokensIn = 0;
  let tokensOut = 0;
  let costUsd = 0;
  const byModelMap = new Map<string, { tokensIn: number; tokensOut: number }>();
  for (const r of rows) {
    const ti = typeof r.metrics.tokensIn === "number" ? r.metrics.tokensIn : 0;
    const to = typeof r.metrics.tokensOut === "number" ? r.metrics.tokensOut : 0;
    tokensIn += ti;
    tokensOut += to;
    if (typeof r.metrics.costUsd === "number") costUsd += r.metrics.costUsd;
    if (ti || to) {
      const key = r.model ?? "—";
      const acc = byModelMap.get(key) ?? { tokensIn: 0, tokensOut: 0 };
      acc.tokensIn += ti;
      acc.tokensOut += to;
      byModelMap.set(key, acc);
    }
  }
  const byModel: ActivitySummaryByModel[] = Array.from(byModelMap.entries())
    .map(([model, v]) => ({ model, tokensIn: v.tokensIn, tokensOut: v.tokensOut }))
    .sort((a, b) => b.tokensIn + b.tokensOut - (a.tokensIn + a.tokensOut));
  return { runCount: rows.length, tokensIn, tokensOut, costUsd, byModel };
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
                <td title={row.startedAt}>{relTime(row.startedAt)}</td>
                <td>{formatDuration(row, now)}</td>
                <td
                  title={`in / out — cache read ${row.metrics.cacheRead ?? "—"} / create ${row.metrics.cacheCreate ?? "—"}`}
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
          <span class="activity-summary-label">Tokens in</span>
          <span class="activity-summary-value">{summary.tokensIn.toLocaleString()}</span>
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
    </div>
  );
}

function ActivityByModelChart({ byModel }: { byModel: ActivitySummaryByModel[] }) {
  const max = byModel.reduce((m, r) => Math.max(m, r.tokensIn + r.tokensOut), 0);
  if (byModel.length === 0 || max === 0) {
    return <div class="activity-summary-chart-empty">No token data in the current filter.</div>;
  }
  return (
    <div class="activity-summary-chart">
      {byModel.map((row) => {
        const total = row.tokensIn + row.tokensOut;
        const width = Math.max(2, Math.round((total / max) * 100));
        return (
          <div class="activity-summary-bar-row" key={row.model}>
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
