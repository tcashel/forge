import { statClass } from "../../lib/format";
import { currentTaskId, selectTask } from "../../signals/tasks";
import { selectedRepo } from "../../signals/ui";
import type { PlanView } from "../../types";

interface MetaItem {
  key: string;
  cls?: string;
  title?: string;
  repo?: string;
  text?: string;
}

function buildMeta(t: PlanView, hideRepo: boolean): MetaItem[] {
  const items: MetaItem[] = [];
  if (!hideRepo) items.push({ key: "repo", repo: t.repo });
  if (t.repoStale) items.push({ key: "stale", cls: "err", text: "stale repo" });
  if (t.agentLabel) items.push({ key: "agent", cls: "agent", text: t.agentLabel });
  if (t.branch) items.push({ key: "branch", text: t.branch });
  if (t.age && t.age !== "—")
    items.push({ key: "age", text: `${t.age}${t.section === "running" ? " running" : " ago"}` });
  // Provenance hint for ready plans — answers "has this been launched before?"
  // without forcing the operator to open the Runs tab. Only shown when there
  // are prior runs; v1 with 0 launches has nothing surprising to say.
  if (t.section === "ready" && t.provenance && t.provenance.priorRuns > 0) {
    const tail = t.provenance.lastRunState ? ` — last: ${t.provenance.lastRunState}` : "";
    items.push({
      key: "prov",
      text: `v${t.provenance.specVersion} · ${t.provenance.priorRuns}× launched${tail}`,
    });
  }
  if (t.kind === "critique-ready") items.push({ key: "crit", cls: "crit-ready", text: "● critique ready" });
  if (t.error) items.push({ key: "err", cls: "err", title: t.error, text: t.error });
  return items;
}

export function PlanRow({ t }: { t: PlanView }) {
  const cls = statClass(t);
  const selected = currentTaskId.value === t.id;
  const items = buildMeta(t, !!selectedRepo.value);
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectTask(t.id);
    }
  };
  return (
    // biome-ignore lint/a11y/useSemanticElements: legacy .task-row div styling owns layout; converting to <button> changes flexbox semantics.
    <div
      class={`task-row ${selected ? "selected" : ""}`}
      data-id={t.id}
      role="button"
      tabIndex={0}
      onClick={() => selectTask(t.id)}
      onKeyDown={onKey}
    >
      <div class="left">
        <span class={`stat-pill ${cls}`}>{t.statLabel}</span>
      </div>
      <div class="task-main">
        <div class="title">{t.title}</div>
        <div class="meta">
          {items.map((m, i) => (
            <>
              {i > 0 ? <span style="color:var(--rule-2)">·</span> : null}
              {m.repo ? (
                <span class="repo-chip">
                  <span class="repo-dot" />
                  {m.repo}
                </span>
              ) : (
                <span class={m.cls} title={m.title}>
                  {m.text}
                </span>
              )}
            </>
          ))}
        </div>
      </div>
      <div class="right-action" />
    </div>
  );
}
