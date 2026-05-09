import { useEffect, useState } from "preact/hooks";
import { runAction } from "../../../lib/actions";
import { type ApiError, apiGet } from "../../../lib/api";
import { renderMarkdown } from "../../../lib/markdown";
import { refreshTasks } from "../../../signals/tasks";
import type { CritiqueAgentMeta, CritiquePayload, TaskView } from "../../../types";

interface CritiqueResponse {
  taskId: string;
  critique: CritiquePayload | null;
}

interface State {
  loading: boolean;
  data: CritiquePayload | null;
  error: string | null;
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

export function CritiqueTab({ t }: { t: TaskView }) {
  const [s, setS] = useState<State>({ loading: true, data: null, error: null });
  useEffect(() => {
    let cancelled = false;
    setS({ loading: true, data: null, error: null });
    apiGet<CritiqueResponse>(`/api/tasks/${encodeURIComponent(t.id)}/critique`)
      .then((data) => {
        if (cancelled) return;
        setS({ loading: false, data: data.critique, error: null });
      })
      .catch((e: ApiError) => {
        if (cancelled) return;
        setS({ loading: false, data: null, error: e.message });
      });
    return () => {
      cancelled = true;
    };
  }, [t.id]);

  if (s.loading) return <p style="color:var(--dim)">Loading critique…</p>;
  if (s.error) return <p style="color:var(--failed)">Could not load critique: {s.error}</p>;
  if (!s.data) {
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
              `/api/tasks/${encodeURIComponent(t.id)}/critique`,
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
  const c = s.data;
  const m = c.meta;
  return (
    <>
      <div style="display:flex; gap:10px; align-items:center; margin-bottom:14px; flex-wrap:wrap">
        <span style="font-size:13px;color:var(--text)">
          <b>Critique status:</b>
        </span>
        <span style="color:var(--ready);font-size:13px">{m.status}</span>
        <span style="margin-left:auto;font-size:11px;color:var(--dim)">{m.startedAt || ""}</span>
      </div>
      <div class="critique-grid">
        <CritiqueCard label="Critic A" agent={m.criticA} content={c.criticA} />
        <CritiqueCard label="Critic B" agent={m.criticB} content={c.criticB} />
        <CritiqueCard label="Synthesizer" agent={m.synthesizer} content={c.synth || c.recommendations} />
      </div>
      {c.recommendations ? (
        <>
          <h3 style="font-size:13px;color:var(--text);margin:18px 0 6px">Recommendations</h3>
          <div
            class="spec"
            style="max-width:none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(c.recommendations) }}
          />
        </>
      ) : null}
    </>
  );
}
