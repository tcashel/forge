import { useEffect, useState } from "preact/hooks";
import { apiGet } from "../../lib/api";
import { MarkdownViewer } from "../MarkdownViewer";

interface Props {
  planId: string;
}

interface SpecResponse {
  planId: string;
  body: string;
}

export function IntentPanel({ planId }: Props) {
  const [body, setBody] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let alive = true;
    setMissing(false);
    setBody(null);
    apiGet<SpecResponse>(`/api/plans/${encodeURIComponent(planId)}/spec?raw=1`)
      .then((data) => {
        if (!alive) return;
        setBody(data.body || "");
      })
      .catch(() => {
        if (!alive) return;
        setMissing(true);
      });
    return () => {
      alive = false;
    };
  }, [planId]);

  if (missing || body == null) return null;

  return (
    <section class="review-intent">
      <header class="review-rail-section-header">
        <h2>Intent</h2>
        <span class="review-rail-section-sub">plan {planId.slice(0, 12)}</span>
      </header>
      <MarkdownViewer markdown={body} class="review-intent-body review-md" />
    </section>
  );
}
