import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { fetchAgentActivityDetail } from "../../lib/api";
import { activitySelectedId } from "../../signals/ui";
import type { ActivityDetailResponse, AgentActivityRow } from "../../types";
import { MarkdownViewer } from "../MarkdownViewer";
import { rowTokens } from "./ActivityTable";

function formatCostUsd(v: number): string {
  if (v >= 1) return `$${v.toFixed(2)}`;
  if (v >= 0.01) return `$${v.toFixed(3)}`;
  return `$${v.toFixed(4)}`;
}

/**
 * Per-bucket token + cost breakdown. Buckets are normalized across adapters
 * (uncached input / cache read / cache create / output), so a claude run's
 * cache reads — most of its volume — are visible here instead of hidden.
 */
function TokenBreakdown({ session }: { session: AgentActivityRow }) {
  const m = session.metrics;
  const hasTokens = m.tokensIn != null || m.tokensOut != null || m.cacheRead != null || m.cacheCreate != null;
  if (!hasTokens && typeof m.costUsd !== "number") return null;
  const t = rowTokens(session);
  const cost = typeof m.costUsd === "number" ? formatCostUsd(m.costUsd) : "—";
  const costSuffix = m.costSource ? ` (${m.costSource}${m.modelPricedAt ? `, ${m.modelPricedAt}` : ""})` : "";
  return (
    <dl class="activity-tokens">
      <div>
        <dt>Input (uncached)</dt>
        <dd>{hasTokens ? t.input.toLocaleString() : "—"}</dd>
      </div>
      <div>
        <dt>Cache read</dt>
        <dd>{hasTokens ? t.cacheRead.toLocaleString() : "—"}</dd>
      </div>
      <div>
        <dt>Cache create</dt>
        <dd>{hasTokens ? t.cacheCreate.toLocaleString() : "—"}</dd>
      </div>
      <div>
        <dt>Total input</dt>
        <dd>{hasTokens ? t.totalInput.toLocaleString() : "—"}</dd>
      </div>
      <div>
        <dt>Output</dt>
        <dd>{hasTokens ? t.output.toLocaleString() : "—"}</dd>
      </div>
      <div>
        <dt>Cost</dt>
        <dd>
          {cost}
          {costSuffix}
        </dd>
      </div>
    </dl>
  );
}

export function ActivityDetail() {
  const data = useSignal<ActivityDetailResponse | null>(null);
  const error = useSignal<string | null>(null);
  const logLines = useSignal<string[]>([]);

  const sid = activitySelectedId.value;

  useEffect(() => {
    if (!sid) {
      data.value = null;
      error.value = null;
      logLines.value = [];
      return;
    }
    let cancelled = false;
    error.value = null;
    void (async () => {
      try {
        const resp = await fetchAgentActivityDetail(sid);
        if (cancelled) return;
        data.value = resp;
      } catch (e) {
        if (cancelled) return;
        error.value = e instanceof Error ? e.message : String(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sid]);

  // SSE log stream for execution/review/fix.
  useEffect(() => {
    const d = data.value;
    if (!d) return;
    if (d.detail.kind !== "execution" && d.detail.kind !== "review" && d.detail.kind !== "fix") return;
    const url = d.detail.logStreamUrl;
    logLines.value = [];
    const es = new EventSource(url);
    const append = (chunk: string) => {
      const lines = chunk.split(/\r?\n/);
      logLines.value = [...logLines.value, ...lines].slice(-500);
    };
    es.addEventListener("snapshot", (evt: MessageEvent) => {
      logLines.value = (evt.data ?? "").split(/\r?\n/);
    });
    es.addEventListener("append", (evt: MessageEvent) => {
      append(evt.data ?? "");
    });
    es.onerror = () => {
      // EventSource auto-retries; surface as a comment if it stays broken.
    };
    return () => es.close();
  }, [data.value?.session.id, data.value?.detail.kind]);

  if (!sid) {
    return <div class="activity-detail empty">Select a row to see details.</div>;
  }
  if (error.value) {
    return <div class="activity-detail error">{error.value}</div>;
  }
  const d = data.value;
  if (!d) return <div class="activity-detail loading">Loading…</div>;

  return (
    <div class="activity-detail">
      <header>
        <div class="title">{d.session.purpose}</div>
        <div class="subtitle">
          {d.session.agentAdapter} {d.session.model ? `· ${d.session.model}` : ""}
        </div>
        <div class="meta">
          <span>state: {d.session.state}</span>
          {d.session.exitCode != null ? <span>exit: {d.session.exitCode}</span> : null}
          {d.session.plan ? <span>spec: {d.session.plan.title}</span> : null}
        </div>
        <TokenBreakdown session={d.session} />
      </header>
      {(d.detail.kind === "execution" || d.detail.kind === "review" || d.detail.kind === "fix") && (
        <pre class="activity-log">{logLines.value.join("\n")}</pre>
      )}
      {(d.detail.kind === "critique" || d.detail.kind === "synthesis" || d.detail.kind === "improvement") && (
        <MarkdownViewer
          markdown={d.detail.markdownContent ?? `(see ${d.detail.markdownPath ?? "—"})`}
          class="activity-markdown"
        />
      )}
      {d.detail.kind === "drafting" && (
        <div class="activity-history">
          {d.detail.planHistory.map((msg, i) => (
            <div key={i} class={`chat-msg role-${msg.role}`}>
              <div class="role">{msg.role}</div>
              <div class="text">{msg.text}</div>
            </div>
          ))}
        </div>
      )}
      {d.detail.kind === "unknown" && <div class="activity-empty">No detail view for this session type.</div>}
    </div>
  );
}
