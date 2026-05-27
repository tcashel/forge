import { useEffect, useState } from "preact/hooks";
import { type ApiError, apiGet } from "../../../lib/api";
import type { JobView, PlanView } from "../../../types";

interface JobsResponse {
  planId: string;
  jobs: JobView[];
}

interface State {
  loading: boolean;
  jobs: JobView[];
  error: string | null;
}

export function RunsTab({ t }: { t: PlanView }) {
  const [s, setS] = useState<State>({ loading: true, jobs: [], error: null });

  useEffect(() => {
    let cancelled = false;
    setS({ loading: true, jobs: [], error: null });
    apiGet<JobsResponse>(`/api/plans/${encodeURIComponent(t.id)}/jobs`)
      .then((data) => {
        if (cancelled) return;
        setS({ loading: false, jobs: data.jobs, error: null });
      })
      .catch((e: ApiError) => {
        if (cancelled) return;
        setS({ loading: false, jobs: [], error: e.message });
      });
    return () => {
      cancelled = true;
    };
  }, [t.id]);

  if (s.loading) return <p style="color:var(--dim)">Loading runs…</p>;
  if (s.error) return <p style="color:var(--failed)">Could not load runs: {s.error}</p>;
  if (s.jobs.length === 0) {
    return (
      <div class="empty-pane">
        <div class="big">No runs yet</div>
        <p>
          Re-launches accumulate here. Older plans may need <code>forge migrate from-json</code> first.
        </p>
      </div>
    );
  }

  return (
    <div class="runs">
      <div class="gh">
        Prior runs
        <span class="summary">
          {s.jobs.length} {s.jobs.length === 1 ? "run" : "runs"}
        </span>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>State</th>
            <th>Started</th>
            <th>Finished</th>
            <th>Summary</th>
          </tr>
        </thead>
        <tbody>
          {s.jobs.map((j) => (
            <tr key={j.id}>
              <td>r{j.run_number}</td>
              <td>
                <span class={`pill ${stateClass(j.state)}`}>{j.state}</span>
              </td>
              <td style="font-family:var(--mono, monospace);color:var(--dim)">
                {j.started_at ? formatTs(j.started_at) : "—"}
              </td>
              <td style="font-family:var(--mono, monospace);color:var(--dim)">
                {j.finished_at ? formatTs(j.finished_at) : "—"}
              </td>
              <td>{j.summary ?? j.blocker_summary ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatTs(iso: string): string {
  return iso.slice(0, 16).replace("T", " ");
}

function stateClass(state: string): string {
  // Reuses the same pass/fail pill classes the gates table uses for visual
  // consistency — green for terminal success, red for failure, neutral for
  // anything in flight.
  switch (state) {
    case "succeeded":
      return "pass";
    case "failed":
      return "fail";
    default:
      return "";
  }
}
