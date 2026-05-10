import { currentTab, currentTask } from "../../signals/tasks";
import { DetailHead } from "./DetailHead";
import { DetailTabs } from "./DetailTabs";
import { CritiqueTab } from "./tabs/CritiqueTab";
import { GatesTab } from "./tabs/GatesTab";
import { LogTab } from "./tabs/LogTab";
import { PlanTab } from "./tabs/PlanTab";
import { SpecTab } from "./tabs/SpecTab";

export function TaskDetail() {
  const t = currentTask.value;
  if (!t) {
    return (
      <div class="detail-empty" id="detail-empty">
        Select a task to see details.
      </div>
    );
  }
  const tab = currentTab.value;
  return (
    <>
      <DetailHead t={t} />
      <DetailTabs t={t} />
      <div class="detail-body" id="detail-body">
        {tab === "log" ? <LogTab t={t} /> : null}
        {tab === "spec" ? <SpecTab t={t} /> : null}
        {tab === "plan" ? <PlanTab t={t} /> : null}
        {tab === "critique" ? <CritiqueTab t={t} /> : null}
        {tab === "gates" ? <GatesTab t={t} /> : null}
      </div>
    </>
  );
}
