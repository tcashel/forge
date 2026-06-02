import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import type { SpecCost, UsageBucket, UsageSummary, UsageTotals, UsageTrendPoint } from "../../../core/usage";
import { fetchUsage } from "../../lib/api";
import { usageFilters } from "../../signals/ui";
import type { UsageFilterState, UsageWindow } from "../../types";

const WINDOWS: Array<{ id: UsageWindow; label: string }> = [
  { id: "7d", label: "7d" },
  { id: "30d", label: "30d" },
  { id: "90d", label: "90d" },
  { id: "all", label: "All" },
];

const REFRESH_MS = 30_000;

// ─── formatters ──────────────────────────────────────────────────────────────

function fmtUsd(v: number): string {
  if (!Number.isFinite(v) || v <= 0) return "$0.00";
  if (v >= 1) return `$${v.toFixed(2)}`;
  if (v >= 0.01) return `$${v.toFixed(3)}`;
  return `$${v.toFixed(4)}`;
}

function fmtCompact(v: number): string {
  if (!Number.isFinite(v) || v === 0) return "0";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
  return String(Math.round(v));
}

function fmtNum(v: number): string {
  return v.toLocaleString();
}

function fmtDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// ─── root view ────────────────────────────────────────────────────────────────

export function UsageView() {
  const data = useSignal<UsageSummary | null>(null);
  const error = useSignal<string | null>(null);
  const loading = useSignal<boolean>(true);

  const filters = usageFilters.value;
  const key = JSON.stringify(filters);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const resp = await fetchUsage(usageFilters.value);
        if (cancelled) return;
        data.value = resp;
        error.value = null;
      } catch (e) {
        if (cancelled) return;
        error.value = e instanceof Error ? e.message : String(e);
      } finally {
        if (!cancelled) loading.value = false;
      }
    };
    void load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [key]);

  const summary = data.value;

  return (
    <div class="usage-view">
      <FilterBar summary={summary} />
      {error.value ? <div class="usage-error">{error.value}</div> : null}
      {!summary && loading.value ? <div class="usage-loading">Loading usage…</div> : null}
      {summary ? (
        <>
          <KpiStrip totals={summary.totals} />
          <TrendCard trend={summary.trend} />
          <CostToShipCard totals={summary.totals} specs={summary.bySpecDetail} />
          <div class="usage-grid">
            <BreakdownCard
              title="By spec"
              buckets={summary.bySpec}
              activeKey={filters.spec}
              valueLabel="cost"
              onSelect={(k) => setFilter("spec", k)}
            />
            <BreakdownCard
              title="By purpose"
              buckets={summary.byPurpose}
              activeKey={filters.purpose}
              valueLabel="cost"
              onSelect={(k) => setFilter("purpose", k)}
            />
            <BreakdownCard
              title="By model"
              buckets={summary.byModel}
              activeKey={filters.model}
              valueLabel="cost"
              onSelect={(k) => setFilter("model", k)}
            />
            <BreakdownCard
              title="By agent"
              buckets={summary.byAgent}
              activeKey={filters.agent}
              valueLabel="cost"
              onSelect={(k) => setFilter("agent", k)}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}

// ─── filter state helpers ──────────────────────────────────────────────────────

function setFilter(dim: "repo" | "spec" | "model" | "agent" | "purpose", value: string | undefined): void {
  const cur = usageFilters.value;
  // Clicking the already-active value clears it (toggle).
  const next: UsageFilterState = { ...cur, [dim]: cur[dim] === value ? undefined : value || undefined };
  usageFilters.value = next;
}

function setWindow(window: UsageWindow): void {
  usageFilters.value = { ...usageFilters.value, window };
}

function clearFilters(): void {
  usageFilters.value = { window: usageFilters.value.window };
}

// ─── filter bar ──────────────────────────────────────────────────────────────

function FilterBar({ summary }: { summary: UsageSummary | null }) {
  const f = usageFilters.value;
  const opts = summary?.options;
  const specTitle = (id?: string) => opts?.specs.find((s) => s.id === id)?.title ?? id;
  const activeChips: Array<{ dim: "repo" | "spec" | "model" | "agent" | "purpose"; label: string }> = [];
  if (f.spec) activeChips.push({ dim: "spec", label: `spec: ${specTitle(f.spec)}` });
  if (f.repo) activeChips.push({ dim: "repo", label: `repo: ${shortRepo(f.repo)}` });
  if (f.model) activeChips.push({ dim: "model", label: `model: ${f.model}` });
  if (f.agent) activeChips.push({ dim: "agent", label: `agent: ${f.agent}` });
  if (f.purpose) activeChips.push({ dim: "purpose", label: `purpose: ${f.purpose}` });

  return (
    <div class="usage-filterbar">
      <div class="usage-windows">
        {WINDOWS.map((w) => (
          <button
            key={w.id}
            type="button"
            class={`nav-chip${f.window === w.id ? " active" : ""}`}
            onClick={() => setWindow(w.id)}
          >
            {w.label}
          </button>
        ))}
      </div>
      <div class="usage-selects">
        <select
          class="usage-select"
          value={f.spec ?? ""}
          onChange={(e) => setFilter("spec", (e.currentTarget as HTMLSelectElement).value || undefined)}
        >
          <option value="">All specs</option>
          {opts?.specs.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
        <select
          class="usage-select"
          value={f.repo ?? ""}
          onChange={(e) => setFilter("repo", (e.currentTarget as HTMLSelectElement).value || undefined)}
        >
          <option value="">All repos</option>
          {opts?.repos.map((r) => (
            <option key={r} value={r}>
              {shortRepo(r)}
            </option>
          ))}
        </select>
      </div>
      <div class="usage-chiprow">
        {(opts?.agents ?? []).map((a) => (
          <button
            key={`a-${a}`}
            type="button"
            class={`nav-chip${f.agent === a ? " active" : ""}`}
            onClick={() => setFilter("agent", a)}
          >
            {a}
          </button>
        ))}
      </div>
      {activeChips.length > 0 ? (
        <div class="usage-active-filters">
          {activeChips.map((c) => (
            <button key={c.dim} type="button" class="usage-active-chip" onClick={() => setFilter(c.dim, undefined)}>
              {c.label} ✕
            </button>
          ))}
          <button type="button" class="usage-clear" onClick={clearFilters}>
            Clear all
          </button>
        </div>
      ) : null}
    </div>
  );
}

function shortRepo(repo: string): string {
  const parts = repo.split("/").filter(Boolean);
  return parts.length ? parts[parts.length - 1] : repo;
}

// ─── KPI strip ─────────────────────────────────────────────────────────────────

function KpiStrip({ totals }: { totals: UsageTotals }) {
  const finished = totals.successCount + totals.failCount;
  const successPct = finished > 0 ? Math.round((totals.successCount / finished) * 100) : null;
  return (
    <div class="usage-kpis">
      <div class="usage-kpi usage-kpi-hero">
        <span class="usage-kpi-label">Total cost</span>
        <span class="usage-kpi-value">{fmtUsd(totals.costUsd)}</span>
        <span class="usage-kpi-sub">
          {fmtUsd(totals.providerCostUsd)} provider · {fmtUsd(totals.estimateCostUsd)} est.
        </span>
      </div>
      <div class="usage-kpi">
        <span class="usage-kpi-label">Runs</span>
        <span class="usage-kpi-value">{fmtNum(totals.runCount)}</span>
        <span class="usage-kpi-sub">{successPct === null ? "—" : `${successPct}% ok`}</span>
      </div>
      <div class="usage-kpi">
        <span class="usage-kpi-label">Avg / run</span>
        <span class="usage-kpi-value">{fmtUsd(totals.avgCostPerRun)}</span>
      </div>
      <div class="usage-kpi">
        <span class="usage-kpi-label">Input (uncached)</span>
        <span class="usage-kpi-value">{fmtCompact(totals.tokensIn)}</span>
      </div>
      <div class="usage-kpi">
        <span class="usage-kpi-label">Cached</span>
        <span class="usage-kpi-value">{fmtCompact(totals.cached)}</span>
      </div>
      <div class="usage-kpi">
        <span class="usage-kpi-label">Output</span>
        <span class="usage-kpi-value">{fmtCompact(totals.tokensOut)}</span>
      </div>
    </div>
  );
}

// ─── trend chart (daily vertical bars) ──────────────────────────────────────────

function TrendCard({ trend }: { trend: UsageTrendPoint[] }) {
  const metric = useSignal<"cost" | "tokens">("cost");
  const pointValue = (p: UsageTrendPoint) =>
    metric.value === "cost" ? p.costUsd : p.tokensIn + p.cached + p.tokensOut;
  const max = trend.reduce((m, p) => Math.max(m, pointValue(p)), 0);
  const hasData = trend.length > 0 && max > 0;
  // Label ~6 evenly spaced ticks so the axis stays readable.
  const tickEvery = Math.max(1, Math.ceil(trend.length / 6));

  return (
    <div class="usage-card usage-trend-card">
      <div class="usage-card-head">
        <span class="usage-card-title">Daily {metric.value === "cost" ? "cost" : "tokens"}</span>
        <div class="usage-toggle">
          <button
            type="button"
            class={`nav-chip${metric.value === "cost" ? " active" : ""}`}
            onClick={() => {
              metric.value = "cost";
            }}
          >
            Cost
          </button>
          <button
            type="button"
            class={`nav-chip${metric.value === "tokens" ? " active" : ""}`}
            onClick={() => {
              metric.value = "tokens";
            }}
          >
            Tokens
          </button>
        </div>
      </div>
      {hasData ? (
        <>
          <div class="usage-trend">
            {trend.map((p, i) => {
              const v = pointValue(p);
              const h = max > 0 ? Math.max(v > 0 ? 2 : 0, Math.round((v / max) * 100)) : 0;
              const label = <span class="usage-trend-label">{i % tickEvery === 0 ? fmtDay(p.date) : ""}</span>;
              if (metric.value === "cost") {
                const title = `${p.date}: ${fmtUsd(p.costUsd)} · ${p.runCount} runs`;
                return (
                  <div class="usage-trend-col" key={p.date} title={title}>
                    <div class="usage-trend-bar-track">
                      <div class="usage-trend-bar" style={{ height: `${h}%` }} />
                    </div>
                    {label}
                  </div>
                );
              }
              // Tokens mode — stack input / cached / output. The column's overall
              // fill height stays proportional to the day total (so magnitude reads),
              // and each segment claims its share of that fill.
              const dayTotal = p.tokensIn + p.cached + p.tokensOut;
              const seg = (x: number) => (dayTotal > 0 ? (x / dayTotal) * 100 : 0);
              const title = `${p.date}: ${fmtNum(dayTotal)} tokens (${fmtNum(p.tokensIn)} in · ${fmtNum(p.cached)} cached · ${fmtNum(p.tokensOut)} out) · ${p.runCount} runs`;
              return (
                <div class="usage-trend-col" key={p.date} title={title}>
                  <div class="usage-trend-bar-track">
                    <div class="usage-trend-stack" style={{ height: `${h}%` }}>
                      <div class="usage-trend-seg usage-trend-seg-output" style={{ height: `${seg(p.tokensOut)}%` }} />
                      <div class="usage-trend-seg usage-trend-seg-cached" style={{ height: `${seg(p.cached)}%` }} />
                      <div class="usage-trend-seg usage-trend-seg-input" style={{ height: `${seg(p.tokensIn)}%` }} />
                    </div>
                  </div>
                  {label}
                </div>
              );
            })}
          </div>
          {metric.value === "tokens" ? (
            <div class="usage-trend-legend">
              <span class="usage-trend-legend-item">
                <span class="usage-trend-swatch usage-trend-seg-input" /> input
              </span>
              <span class="usage-trend-legend-item">
                <span class="usage-trend-swatch usage-trend-seg-cached" /> cached
              </span>
              <span class="usage-trend-legend-item">
                <span class="usage-trend-swatch usage-trend-seg-output" /> output
              </span>
            </div>
          ) : null}
        </>
      ) : (
        <div class="usage-empty">No usage in this window.</div>
      )}
    </div>
  );
}

// ─── cost-to-ship / rework lens ─────────────────────────────────────────────────

const CTS_TOP_N = 10;

const OUTCOME_LABEL: Record<SpecCost["outcome"], string> = {
  shipped: "shipped",
  failed: "failed",
  abandoned: "abandoned",
  active: "active",
};

function CostToShipCard({ totals, specs }: { totals: UsageTotals; specs: SpecCost[] }) {
  const reworkRatioPct = totals.costUsd > 0 ? Math.round((totals.wastedSpendUsd / totals.costUsd) * 100) : 0;
  const shown = specs.slice(0, CTS_TOP_N);
  // Scale every spec's segmented bar against the largest spec total so widths compare.
  const maxTotal = specs.reduce((m, s) => Math.max(m, s.total), 0);

  return (
    <div class="usage-card usage-cts-card">
      <div class="usage-card-head">
        <span class="usage-card-title">Cost to ship</span>
      </div>
      <div class="usage-cts-kpis">
        <div class="usage-kpi usage-kpi-hero">
          <span class="usage-kpi-label">Cost / shipped spec</span>
          <span class="usage-kpi-value">{fmtUsd(totals.costPerShippedSpec)}</span>
          <span class="usage-kpi-sub" title="“Shipped” = PR created or status done (no merged signal in the DB).">
            {fmtNum(totals.shippedSpecCount)} shipped · proxy: PR-created/done
          </span>
        </div>
        <div class="usage-kpi">
          <span class="usage-kpi-label">Wasted spend</span>
          <span class="usage-kpi-value">{fmtUsd(totals.wastedSpendUsd)}</span>
          <span class="usage-kpi-sub">
            {fmtUsd(totals.reworkCostUsd)} rework · {fmtUsd(totals.failedSpendUsd)} failed
          </span>
        </div>
        <div class="usage-kpi">
          <span class="usage-kpi-label">Rework ratio</span>
          <span class="usage-kpi-value">{reworkRatioPct}%</span>
          <span class="usage-kpi-sub">wasted / total spend</span>
        </div>
      </div>
      {shown.length === 0 ? (
        <div class="usage-empty">No spec-linked usage in this window.</div>
      ) : (
        <div class="usage-cts-list">
          {shown.map((s) => {
            const width = maxTotal > 0 ? Math.max(s.total > 0 ? 2 : 0, Math.round((s.total / maxTotal) * 100)) : 0;
            const denom = s.execution + s.review + s.fix || 1;
            const foughtBack = s.reworkCost >= s.execution && s.reworkCost > 0;
            const title = `${s.title} — ${fmtUsd(s.total)} total · ${fmtUsd(s.execution)} exec · ${fmtUsd(s.review)} review · ${fmtUsd(s.fix)} fix · ${s.fixRounds} fix rounds · ${Math.round(s.reworkRatio * 100)}% rework`;
            return (
              <div class="usage-cts-row" key={s.planId} title={title}>
                <span class={`usage-cts-badge usage-cts-${s.outcome}`}>{OUTCOME_LABEL[s.outcome]}</span>
                <span class="usage-cts-name">
                  {s.title}
                  {foughtBack ? <span class="usage-cts-chip">fought back</span> : null}
                </span>
                <span class="usage-cts-bar-track" style={{ width: `${width}%` }}>
                  <span class="usage-cts-seg usage-cts-seg-exec" style={{ width: `${(s.execution / denom) * 100}%` }} />
                  <span class="usage-cts-seg usage-cts-seg-review" style={{ width: `${(s.review / denom) * 100}%` }} />
                  <span class="usage-cts-seg usage-cts-seg-fix" style={{ width: `${(s.fix / denom) * 100}%` }} />
                </span>
                <span class="usage-cts-rounds">{s.fixRounds > 0 ? `${s.fixRounds}×fix` : ""}</span>
                <span class="usage-cts-total">{fmtUsd(s.total)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── breakdown card (horizontal bars, cross-filtering) ──────────────────────────

const TOP_N = 12;

function BreakdownCard({
  title,
  buckets,
  activeKey,
  valueLabel,
  onSelect,
}: {
  title: string;
  buckets: UsageBucket[];
  activeKey?: string;
  valueLabel: "cost";
  onSelect: (key: string) => void;
}) {
  void valueLabel;
  const shown = buckets.slice(0, TOP_N);
  const rest = buckets.slice(TOP_N);
  const restCost = rest.reduce((s, b) => s + b.costUsd, 0);
  const max = buckets.reduce((m, b) => Math.max(m, b.costUsd), 0);

  return (
    <div class="usage-card">
      <div class="usage-card-head">
        <span class="usage-card-title">{title}</span>
      </div>
      {buckets.length === 0 ? (
        <div class="usage-empty">No data.</div>
      ) : (
        <div class="usage-bars">
          {shown.map((b) => {
            const selectable = !b.key.startsWith("__");
            const active = activeKey != null && activeKey === b.key;
            const width = max > 0 ? Math.max(b.costUsd > 0 ? 2 : 0, Math.round((b.costUsd / max) * 100)) : 0;
            return (
              <button
                type="button"
                key={b.key}
                class={`usage-bar-row${active ? " active" : ""}${selectable ? "" : " static"}`}
                title={`${b.label} — ${fmtUsd(b.costUsd)} · ${fmtCompact(b.tokensIn + b.cached + b.tokensOut)} tok · ${b.runCount} runs`}
                disabled={!selectable}
                onClick={() => selectable && onSelect(b.key)}
              >
                <span class="usage-bar-label">{b.label}</span>
                <span class="usage-bar-track">
                  <span class="usage-bar-fill" style={{ width: `${width}%` }} />
                </span>
                <span class="usage-bar-value">{fmtUsd(b.costUsd)}</span>
              </button>
            );
          })}
          {rest.length > 0 ? (
            <div class="usage-bar-row static">
              <span class="usage-bar-label usage-bar-other">+{rest.length} more</span>
              <span class="usage-bar-track" />
              <span class="usage-bar-value">{fmtUsd(restCost)}</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
