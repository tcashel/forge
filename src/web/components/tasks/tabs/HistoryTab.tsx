import { useEffect, useState } from "preact/hooks";
import { type ApiError, apiGet } from "../../../lib/api";
import type { PlanHistoryEvent, PlanView } from "../../../types";

interface HistoryResponse {
  planId: string;
  events: PlanHistoryEvent[];
}

interface State {
  loading: boolean;
  events: PlanHistoryEvent[];
  error: string | null;
}

export function HistoryTab({ t }: { t: PlanView }) {
  const [s, setS] = useState<State>({ loading: true, events: [], error: null });

  useEffect(() => {
    let cancelled = false;
    setS({ loading: true, events: [], error: null });
    apiGet<HistoryResponse>(`/api/plans/${encodeURIComponent(t.id)}/history`)
      .then((data) => {
        if (cancelled) return;
        setS({ loading: false, events: data.events, error: null });
      })
      .catch((e: ApiError) => {
        if (cancelled) return;
        setS({ loading: false, events: [], error: e.message });
      });
    return () => {
      cancelled = true;
    };
  }, [t.id]);

  if (s.loading) return <p style="color:var(--dim)">Loading history…</p>;
  if (s.error) return <p style="color:var(--failed)">Could not load history: {s.error}</p>;
  if (s.events.length === 0) {
    return (
      <div class="empty-pane">
        <div class="big">No events recorded yet</div>
        <p>
          This plan has no SQLite events. If it predates the migration, run <code>forge migrate from-json</code> to
          backfill.
        </p>
      </div>
    );
  }

  return (
    <div class="history">
      <ol class="timeline" style="list-style:none;padding-left:0">
        {s.events.map((e) => (
          <li
            key={`${e.ref}:${e.kind}:${e.ts}`}
            style="display:grid;grid-template-columns:auto 1fr;gap:0.75rem;padding:0.4rem 0;border-bottom:1px solid var(--border)"
          >
            <span style="color:var(--dim);font-family:var(--mono, monospace);white-space:nowrap">{formatTs(e.ts)}</span>
            <span>
              <span
                class="pill"
                style={`background:${kindColor(e.kind)};color:var(--bg);padding:0 0.4rem;border-radius:0.2rem;margin-right:0.5rem`}
              >
                {labelFor(e.kind)}
              </span>
              {e.summary}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function formatTs(iso: string): string {
  // Drop seconds + zone for scannability — operators read the timeline to
  // reconstruct a narrative, not debug clock skew.
  return iso.slice(0, 16).replace("T", " ");
}

function labelFor(kind: PlanHistoryEvent["kind"]): string {
  switch (kind) {
    case "spec_saved":
      return "spec";
    case "critique_started":
      return "critique";
    case "critique_synthesized":
      return "synth";
    case "launch_started":
      return "launch";
    case "launch_completed":
      return "result";
  }
}

function kindColor(kind: PlanHistoryEvent["kind"]): string {
  // Match the existing CSS palette — these vars all live in src/web/styles.css.
  switch (kind) {
    case "spec_saved":
      return "var(--accent, #888)";
    case "critique_started":
    case "critique_synthesized":
      return "var(--review, #b8860b)";
    case "launch_started":
      return "var(--live, #2980b9)";
    case "launch_completed":
      return "var(--ok, #27ae60)";
  }
}
