import { useEffect, useState } from "preact/hooks";
import { type ApiError, apiGet, apiPost } from "../../../lib/api";
import { refreshTasks } from "../../../signals/tasks";
import type { PlanView, PlanWorkspaceResponse } from "../../../types";
import { MarkdownViewer } from "../../MarkdownViewer";

interface State {
  loading: boolean;
  data: PlanWorkspaceResponse | null;
  error: string | null;
  editing: boolean;
  draftBody: string;
  busy: boolean;
}

export function PlanDocumentPane({ t, refreshKey = 0 }: { t: PlanView; refreshKey?: number }) {
  const [s, setS] = useState<State>({
    loading: true,
    data: null,
    error: null,
    editing: false,
    draftBody: "",
    busy: false,
  });

  async function load(cancelled?: () => boolean): Promise<void> {
    setS((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await apiGet<PlanWorkspaceResponse>(`/api/plans/${encodeURIComponent(t.id)}/plan-workspace`);
      if (cancelled?.()) return;
      setS((prev) => ({
        ...prev,
        loading: false,
        data,
        draftBody: data.body,
        error: null,
      }));
    } catch (e) {
      if (cancelled?.()) return;
      const err = e as ApiError;
      setS((prev) => ({ ...prev, loading: false, error: err.message || "Failed to load plan document." }));
    }
  }

  useEffect(() => {
    let cancelled = false;
    void load(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, [t.id, refreshKey]);

  async function postAction(action: "accept" | "reject"): Promise<void> {
    setS((prev) => ({ ...prev, busy: true, error: null }));
    try {
      const data = await apiPost<PlanWorkspaceResponse>(
        `/api/plans/${encodeURIComponent(t.id)}/plan-edit/${action}`,
        {},
      );
      setS((prev) => ({ ...prev, busy: false, data, draftBody: data.body, editing: false }));
      void refreshTasks();
    } catch (e) {
      const err = e as ApiError;
      setS((prev) => ({ ...prev, busy: false, error: err.message || `${action} failed.` }));
    }
  }

  async function saveDirectEdit(): Promise<void> {
    setS((prev) => ({ ...prev, busy: true, error: null }));
    try {
      const data = await apiPost<PlanWorkspaceResponse>(`/api/plans/${encodeURIComponent(t.id)}/plan-edit/direct`, {
        body: s.draftBody,
      });
      setS((prev) => ({ ...prev, busy: false, data, draftBody: data.body, editing: false }));
      void refreshTasks();
    } catch (e) {
      const err = e as ApiError;
      setS((prev) => ({ ...prev, busy: false, error: err.message || "Save failed." }));
    }
  }

  if (s.loading && !s.data) {
    return (
      <div class="plan-doc-pane spec" id="spec-out">
        <p style="color:var(--dim)">Loading spec…</p>
      </div>
    );
  }

  if (s.error && !s.data) {
    return (
      <div class="plan-doc-pane spec" id="spec-out">
        <p style="color:var(--failed)">Could not load spec: {s.error}</p>
      </div>
    );
  }

  const data = s.data;
  if (!data) return null;

  return (
    <div class="plan-doc-pane" id="spec-out">
      <div class="plan-doc-head">
        <div>
          <div class="plan-doc-eyebrow">Live spec document</div>
          <h3>{data.parsed.title ?? t.title}</h3>
          <div class="plan-doc-meta">
            v{data.specVersion} · {data.openQuestionCount} open question{data.openQuestionCount === 1 ? "" : "s"}
          </div>
        </div>
        <button
          type="button"
          class="btn sm btn-ghost"
          disabled={s.busy}
          onClick={() => setS((prev) => ({ ...prev, editing: !prev.editing, draftBody: data.body }))}
        >
          {s.editing ? "Cancel edit" : "Edit document"}
        </button>
      </div>

      {s.error ? <div class="plan-doc-error">{s.error}</div> : null}

      {data.pendingEdit ? (
        <div class="pending-plan-edit">
          <div class="pending-plan-edit-head">
            <div>
              <strong>Planner proposed an edit</strong>
              <span>
                {data.pendingEdit.note ? ` ${data.pendingEdit.note}` : ""} · based on v{data.pendingEdit.baseVersion}
              </span>
            </div>
            <div class="pending-plan-edit-actions">
              <button
                type="button"
                class="btn sm btn-secondary"
                disabled={s.busy}
                onClick={() => void postAction("reject")}
              >
                Reject
              </button>
              <button
                type="button"
                class="btn sm btn-primary"
                disabled={s.busy}
                onClick={() => void postAction("accept")}
              >
                Accept
              </button>
            </div>
          </div>
          <pre class="plan-diff">
            <code>{data.pendingEdit.diff || "(no diff)"}</code>
          </pre>
        </div>
      ) : null}

      {s.editing ? (
        <div class="plan-direct-edit">
          <textarea
            value={s.draftBody}
            onInput={(e) => setS((prev) => ({ ...prev, draftBody: (e.currentTarget as HTMLTextAreaElement).value }))}
          />
          <div class="plan-direct-actions">
            <span>Direct editing is available for human corrections; planner edits still stage as diffs.</span>
            <button type="button" class="btn sm btn-primary" disabled={s.busy} onClick={() => void saveDirectEdit()}>
              Save document
            </button>
          </div>
        </div>
      ) : (
        <MarkdownViewer markdown={data.body || "_No spec body yet._"} class="spec plan-markdown-document" />
      )}
    </div>
  );
}
