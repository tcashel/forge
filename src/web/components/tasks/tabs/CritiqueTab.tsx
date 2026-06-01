import { useEffect, useRef, useState } from "preact/hooks";
import { runAction } from "../../../lib/actions";
import { type ApiError, apiGet } from "../../../lib/api";
import { refreshTasks } from "../../../signals/tasks";
import type { CritiqueAgentMeta, CritiqueAttemptSummary, CritiquePayload, PlanView } from "../../../types";
import { MarkdownViewer } from "../../MarkdownViewer";

interface CritiqueResponse {
  planId: string;
  critique: CritiquePayload | null;
}

interface CritiquesListResponse {
  planId: string;
  attempts: CritiqueAttemptSummary[];
}

interface State {
  loading: boolean;
  attempts: CritiqueAttemptSummary[];
  selectedId: string | null;
  selected: CritiquePayload | null;
  error: string | null;
}

// Synthesizer output is stored wrapped in a ```forge-spec-recommendations
// envelope (a machine-readable contract). Strip it so the inner markdown
// renders as headings/lists rather than one big code block.
const RECS_FENCE_RE = /```forge-spec-recommendations\s*\n([\s\S]*?)\n```/;
function unwrapRecommendations(md: string): string {
  const m = md.match(RECS_FENCE_RE);
  return m ? m[1] : md;
}

function relativeTime(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso;
  const diffMs = Date.now() - t;
  const sec = Math.round(diffMs / 1000);
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.round(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.round(sec / 3600)}h ago`;
  return new Date(t).toLocaleDateString();
}

function statusColor(status: string): string {
  if (status === "done") return "var(--ready, #2ecc71)";
  if (status === "failed") return "var(--failed, #c0392b)";
  if (status === "running_critics" || status === "running_synth") return "var(--running, #3498db)";
  return "var(--dim)";
}

function agentDot(agent: CritiqueAgentMeta | null | undefined, label: string) {
  const status = agent?.status ?? "—";
  return (
    <span
      style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--dim)"
      title={`${label}: ${status}`}
    >
      <span style={`width:6px;height:6px;border-radius:50%;background:${statusColor(status)};display:inline-block`} />
      {label}
    </span>
  );
}

function CritiqueCard({
  label,
  agent,
  content,
}: {
  label: string;
  agent: CritiqueAgentMeta | null | undefined;
  content: string | null;
}) {
  const agentLabel = agent ? `${agent.agent} · ${agent.model}` : "—";
  const status = agent ? agent.status : "—";
  return (
    <div class="critique-card">
      <div class="role">{label}</div>
      <div class="agent">{agentLabel}</div>
      <div class="verdict">{status}</div>
      <div class="summary">
        {content ? content.slice(0, 1200) : <span style="color:var(--dim)">No output yet</span>}
      </div>
    </div>
  );
}

export function CritiqueTab({ t }: { t: PlanView }) {
  const [s, setS] = useState<State>({
    loading: true,
    attempts: [],
    selectedId: null,
    selected: null,
    error: null,
  });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch the attempts list. Updates state in place; safe to call from
  // both mount + poller without flashing the UI.
  const refetchAttempts = async (selectedId: string | null): Promise<void> => {
    try {
      const list = await apiGet<CritiquesListResponse>(`/api/plans/${encodeURIComponent(t.id)}/critiques`);
      const attempts = list.attempts;
      // Selection: keep existing if it still exists, otherwise newest.
      const nextSelected = attempts.find((a) => a.id === selectedId)?.id ?? attempts[0]?.id ?? null;
      // Only refetch the detail if selection changed; otherwise let the
      // previous detail stay rendered (no flash).
      if (nextSelected && nextSelected !== selectedId) {
        try {
          const detail = await apiGet<CritiqueResponse>(
            `/api/plans/${encodeURIComponent(t.id)}/critique?critiqueId=${encodeURIComponent(nextSelected)}`,
          );
          setS((prev) => ({
            ...prev,
            loading: false,
            attempts,
            selectedId: nextSelected,
            selected: detail.critique,
            error: null,
          }));
          return;
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          setS((prev) => ({ ...prev, loading: false, attempts, selectedId: nextSelected, error: msg }));
          return;
        }
      }
      setS((prev) => ({ ...prev, loading: false, attempts, selectedId: nextSelected, error: null }));
    } catch (e) {
      const msg = e instanceof Error ? (e as ApiError).message : String(e);
      setS((prev) => ({ ...prev, loading: false, error: msg }));
    }
  };

  // Initial load: list + selected detail.
  useEffect(() => {
    let cancelled = false;
    setS({ loading: true, attempts: [], selectedId: null, selected: null, error: null });
    (async () => {
      try {
        const list = await apiGet<CritiquesListResponse>(`/api/plans/${encodeURIComponent(t.id)}/critiques`);
        if (cancelled) return;
        const newest = list.attempts[0]?.id ?? null;
        if (!newest) {
          setS({ loading: false, attempts: [], selectedId: null, selected: null, error: null });
          return;
        }
        const detail = await apiGet<CritiqueResponse>(
          `/api/plans/${encodeURIComponent(t.id)}/critique?critiqueId=${encodeURIComponent(newest)}`,
        );
        if (cancelled) return;
        setS({
          loading: false,
          attempts: list.attempts,
          selectedId: newest,
          selected: detail.critique,
          error: null,
        });
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? (e as ApiError).message : String(e);
        setS((prev) => ({ ...prev, loading: false, error: msg }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t.id]);

  // Poll attempts list every 3s while anything is in flight.
  useEffect(() => {
    const anyInFlight = s.attempts.some((a) => a.status === "running_critics" || a.status === "running_synth");
    if (!anyInFlight) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }
    if (pollRef.current) return;
    pollRef.current = setInterval(() => {
      void refetchAttempts(s.selectedId);
    }, 3000);
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [s.attempts, s.selectedId, t.id]);

  const selectAttempt = async (id: string): Promise<void> => {
    if (id === s.selectedId) return;
    setS((prev) => ({ ...prev, selectedId: id, selected: null }));
    try {
      const detail = await apiGet<CritiqueResponse>(
        `/api/plans/${encodeURIComponent(t.id)}/critique?critiqueId=${encodeURIComponent(id)}`,
      );
      setS((prev) => ({ ...prev, selectedId: id, selected: detail.critique, error: null }));
    } catch (e) {
      const msg = e instanceof Error ? (e as ApiError).message : String(e);
      setS((prev) => ({ ...prev, error: msg }));
    }
  };

  if (s.loading) return <p style="color:var(--dim)">Loading critique…</p>;
  if (s.error && s.attempts.length === 0) return <p style="color:var(--failed)">Could not load critique: {s.error}</p>;
  if (s.attempts.length === 0) {
    return (
      <div class="empty-pane">
        <div class="big">No critique on file</div>
        <p>Run a two-critic + synthesizer pass before launching:</p>
        <button
          type="button"
          class="btn btn-primary"
          id="crit-run"
          onClick={() =>
            runAction(
              `/api/plans/${encodeURIComponent(t.id)}/critique`,
              { successMsg: `Critique queued for ${t.id}` },
              refreshTasks,
            )
          }
        >
          Run critique
        </button>
      </div>
    );
  }

  return (
    <>
      <div class="critique-attempts" style="margin-bottom:18px">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px">
          <div style="font-size:12.5px;color:var(--text)">
            <b>{s.attempts.length}</b> attempt{s.attempts.length === 1 ? "" : "s"}
          </div>
          <div style="display:flex;gap:6px">
            <button
              type="button"
              class="btn btn-secondary"
              style="font-size:11.5px;padding:4px 10px"
              onClick={() =>
                runAction(
                  `/api/plans/${encodeURIComponent(t.id)}/improve`,
                  { successMsg: `Improve queued for ${t.id}` },
                  refreshTasks,
                )
              }
              title="Run the critique + improver pipeline; applies findings to the spec"
            >
              Run improver
            </button>
            <button
              type="button"
              class="btn btn-ghost"
              style="font-size:11.5px;padding:4px 10px"
              onClick={() =>
                runAction(
                  `/api/plans/${encodeURIComponent(t.id)}/critique`,
                  { successMsg: `Critique queued for ${t.id}` },
                  refreshTasks,
                )
              }
              title="Run critique only (no auto-improve)"
            >
              New critique
            </button>
          </div>
        </div>
        <div style="border:1px solid var(--rule);border-radius:8px;overflow:hidden">
          {s.attempts.map((a) => {
            const isSelected = a.id === s.selectedId;
            const isRunning = a.status === "running_critics" || a.status === "running_synth";
            return (
              <button
                type="button"
                key={a.id}
                onClick={() => void selectAttempt(a.id)}
                style={`display:flex;align-items:center;gap:12px;padding:10px 12px;cursor:pointer;border:0;border-bottom:1px solid var(--rule);background:${isSelected ? "var(--panel-hover, rgba(120,120,140,0.08))" : "transparent"};width:100%;text-align:left;color:inherit;font:inherit`}
              >
                <span
                  style={`width:8px;height:8px;border-radius:50%;background:${statusColor(a.status)};flex:none;${isRunning ? "animation:pulse 1.4s ease-in-out infinite" : ""}`}
                />
                <span style="font-size:12.5px;color:var(--text);font-weight:600;min-width:110px">{a.status}</span>
                <span style="font-size:11.5px;color:var(--dim);min-width:80px">{relativeTime(a.startedAt)}</span>
                <span style="display:flex;gap:10px;flex:1">
                  {agentDot(a.criticA, "A")}
                  {agentDot(a.criticB, "B")}
                  {agentDot(a.synthesizer, "Synth")}
                </span>
                <span style="font-size:10.5px;color:var(--dim);font-family:'JetBrains Mono',monospace">{a.id}</span>
              </button>
            );
          })}
        </div>
      </div>

      {s.selected ? (
        <>
          <div style="display:flex; gap:10px; align-items:center; margin-bottom:14px; flex-wrap:wrap">
            <span style="font-size:13px;color:var(--text)">
              <b>Selected:</b>
            </span>
            <span style={`color:${statusColor(s.selected.meta.status)};font-size:13px`}>{s.selected.meta.status}</span>
            <span style="margin-left:auto;font-size:11px;color:var(--dim)">{s.selected.meta.startedAt || ""}</span>
          </div>
          <div class="critique-grid">
            <CritiqueCard label="Critic A" agent={s.selected.meta.criticA} content={s.selected.criticA} />
            <CritiqueCard label="Critic B" agent={s.selected.meta.criticB} content={s.selected.criticB} />
            <CritiqueCard
              label="Synthesizer"
              agent={s.selected.meta.synthesizer}
              content={s.selected.synth || s.selected.recommendations}
            />
          </div>
          {s.selected.recommendations ? (
            <>
              <h3 style="font-size:13px;color:var(--text);margin:18px 0 6px">Recommendations</h3>
              <MarkdownViewer markdown={unwrapRecommendations(s.selected.recommendations)} class="spec" />
            </>
          ) : null}
        </>
      ) : (
        <p style="color:var(--dim)">Loading selected attempt…</p>
      )}
    </>
  );
}
