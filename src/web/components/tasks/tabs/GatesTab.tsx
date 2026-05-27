import { useEffect, useState } from "preact/hooks";
import { type ApiError, apiGet } from "../../../lib/api";
import { formatDur } from "../../../lib/format";
import type { PlanView, QualityResult } from "../../../types";

interface TaskResponse {
  task: PlanView;
  meta: { qualityResults?: QualityResult[] } | null;
}

interface State {
  loading: boolean;
  results: QualityResult[];
  error: string | null;
}

export function GatesTab({ t }: { t: PlanView }) {
  const [s, setS] = useState<State>({ loading: true, results: [], error: null });
  useEffect(() => {
    let cancelled = false;
    setS({ loading: true, results: [], error: null });
    apiGet<TaskResponse>(`/api/plans/${encodeURIComponent(t.id)}`)
      .then((data) => {
        if (cancelled) return;
        const r = data.meta?.qualityResults || [];
        setS({ loading: false, results: r, error: null });
      })
      .catch((e: ApiError) => {
        if (cancelled) return;
        setS({ loading: false, results: [], error: e.message });
      });
    return () => {
      cancelled = true;
    };
  }, [t.id]);

  if (s.loading) return <p style="color:var(--dim)">Loading quality gates…</p>;
  if (s.error) return <p style="color:var(--failed)">Could not load gates: {s.error}</p>;
  if (s.results.length === 0) {
    return (
      <div class="empty-pane">
        <div class="big">No quality run yet</div>
        <p>Quality gates run automatically after the agent commits its work.</p>
      </div>
    );
  }
  const passCount = s.results.filter((r) => r.ok).length;
  const summary = passCount === s.results.length ? "All passed" : `${passCount} of ${s.results.length} passed`;
  return (
    <div class="gates">
      <div class="gh">
        Quality gates
        <span class="summary">{summary}</span>
      </div>
      <table>
        {s.results.map((r) => (
          <tr key={r.command}>
            <td class="cmd">{r.command}</td>
            <td class="stat">
              <span class={`pill ${r.ok ? "pass" : "fail"}`}>{r.ok ? "PASS" : "FAIL"}</span>
            </td>
            <td class="dur">{formatDur(r.durationMs)}</td>
          </tr>
        ))}
      </table>
    </div>
  );
}
