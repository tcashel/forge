import { useEffect, useState } from "preact/hooks";
import { type ApiError, apiGet } from "../../../lib/api";
import { renderMarkdown } from "../../../lib/markdown";
import type { TaskView } from "../../../types";

interface SpecResponse {
  taskId: string;
  body: string;
}

interface State {
  loading: boolean;
  html: string | null;
  error: string | null;
}

export function SpecTab({ t }: { t: TaskView }) {
  const [s, setS] = useState<State>({ loading: true, html: null, error: null });
  useEffect(() => {
    let cancelled = false;
    setS({ loading: true, html: null, error: null });
    apiGet<SpecResponse>(`/api/tasks/${encodeURIComponent(t.id)}/spec?raw=1`)
      .then((data) => {
        if (cancelled) return;
        setS({ loading: false, html: renderMarkdown(data.body || ""), error: null });
      })
      .catch((e: ApiError) => {
        if (cancelled) return;
        setS({ loading: false, html: null, error: e.message });
      });
    return () => {
      cancelled = true;
    };
  }, [t.id]);

  if (s.loading) {
    return (
      <div class="spec" id="spec-out">
        <p style="color:var(--dim)">Loading spec…</p>
      </div>
    );
  }
  if (s.error) {
    return (
      <div class="spec" id="spec-out">
        <p style="color:var(--failed)">Could not load spec: {s.error}</p>
      </div>
    );
  }
  return <div class="spec" id="spec-out" dangerouslySetInnerHTML={{ __html: s.html ?? "" }} />;
}
