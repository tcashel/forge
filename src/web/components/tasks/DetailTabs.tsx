import { currentTab } from "../../signals/tasks";
import type { PlanView, TabId } from "../../types";

interface TabDef {
  id: TabId;
  label: string;
  enabled: boolean;
  badgeKind?: "live" | "alert" | "pill";
  badgeText?: string;
}

function tabsFor(t: PlanView): TabDef[] {
  const isRun = t.section === "running";
  return [
    {
      id: "log",
      label: "Live log",
      enabled: isRun || t.kind === "failed" || t.section === "done",
      badgeKind: isRun ? "live" : undefined,
    },
    { id: "spec", label: "Spec", enabled: t.hasSpec },
    { id: "plan", label: "Plan chat", enabled: true },
    {
      id: "critique",
      label: "Critique",
      enabled: !!t.critique,
      badgeKind: t.kind === "critique-ready" ? "alert" : undefined,
    },
    { id: "gates", label: "Quality gates", enabled: isRun || t.kind === "failed" || t.section === "done" },
  ];
}

export function DetailTabs({ t }: { t: PlanView }) {
  const active = currentTab.value;
  return (
    <nav class="tabs" id="detail-tabs">
      {tabsFor(t).map((tab) => (
        <button
          key={tab.id}
          type="button"
          class={`tab ${active === tab.id ? "active" : ""}`}
          data-tab={tab.id}
          disabled={!tab.enabled}
          style={tab.enabled ? undefined : "opacity:0.4;cursor:not-allowed"}
          onClick={() => {
            if (!tab.enabled) return;
            currentTab.value = tab.id;
          }}
        >
          {tab.badgeKind === "live" ? <span class="dot live" /> : null}
          {tab.badgeKind === "alert" ? <span class="dot alert" /> : null}
          {tab.badgeKind === "pill" ? <span class="pill">{tab.badgeText}</span> : null} {tab.label}
        </button>
      ))}
    </nav>
  );
}
