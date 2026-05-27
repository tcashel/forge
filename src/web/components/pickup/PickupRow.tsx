import { selectTask } from "../../signals/tasks";
import type { PlanView, TabId } from "../../types";

export interface Pickup {
  kind: "attention" | "failed" | "running";
  kindLabel: string;
  when: string;
  repo: string;
  title: string;
  blurb: string;
  planId: string;
  defaultTab: TabId;
}

export function derivePickups(visibleTasks: PlanView[]): Pickup[] {
  const out: Pickup[] = [];
  for (const t of visibleTasks) {
    if (t.kind === "critique-ready") {
      out.push({
        kind: "attention",
        kindLabel: "Critique ready",
        when: `${t.age} ago`,
        repo: t.repo,
        title: t.title,
        blurb: t.blurb || "Critique finished — review before launching.",
        planId: t.id,
        defaultTab: "critique",
      });
    }
  }
  for (const t of visibleTasks) {
    if (t.kind === "failed") {
      out.push({
        kind: "failed",
        kindLabel: t.statLabel,
        when: `${t.age} ago`,
        repo: t.repo,
        title: t.title,
        blurb: t.error || t.blurb || "Run did not finish — open the log to inspect.",
        planId: t.id,
        defaultTab: "log",
      });
    }
  }
  const running = visibleTasks.filter((t) => t.section === "running");
  if (out.length === 0 && running.length > 0) {
    const t = running[0];
    out.push({
      kind: "running",
      kindLabel: "Running now",
      when: `${t.age}`,
      repo: t.repo,
      title: t.title,
      blurb: t.agentLabel ? `${t.agentLabel}. Tail the log to follow.` : "Tail the log to follow.",
      planId: t.id,
      defaultTab: "log",
    });
  }
  return out.slice(0, 4);
}

export function PickupRow({ p }: { p: Pickup }) {
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectTask(p.planId, p.defaultTab);
    }
  };
  return (
    // biome-ignore lint/a11y/useSemanticElements: legacy .card div styling owns layout; converting to <button> changes flexbox semantics.
    <div
      class={`card ${p.kind}`}
      role="button"
      tabIndex={0}
      onClick={() => selectTask(p.planId, p.defaultTab)}
      onKeyDown={onKey}
    >
      <div class="top">
        <span class="kind">● {p.kindLabel}</span>
        {p.repo ? (
          <span class="repo-chip">
            <span class="repo-dot" />
            {p.repo}
          </span>
        ) : null}
        <span class="when">{p.when}</span>
      </div>
      <div class="title">{p.title}</div>
      <div class="blurb">{p.blurb}</div>
    </div>
  );
}
