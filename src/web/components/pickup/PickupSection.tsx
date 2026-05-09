import { useComputed } from "@preact/signals";
import { repos } from "../../signals/repos";
import { visibleTasks } from "../../signals/tasks";
import { selectedRepo } from "../../signals/ui";
import { derivePickups, PickupRow } from "./PickupRow";

function selectedRepoLabel(repoList: { root: string; name: string }[], sel: string): string {
  if (!sel) return "";
  const r = repoList.find((x) => x.root === sel || x.name === sel);
  return r ? r.name : sel;
}

export function PickupSection() {
  const picks = useComputed(() => derivePickups(visibleTasks.value));
  const list = picks.value;
  const label = selectedRepoLabel(repos.value, selectedRepo.value);
  if (list.length === 0) {
    // Match the legacy behaviour: when nothing is waiting, hide the
    // entire section (the styles already account for the missing block).
    return null;
  }
  const sub =
    list.length === 1
      ? `1 thing waiting on you${label ? ` in ${label}` : ""}`
      : `${list.length} things waiting on you${label ? ` in ${label}` : ""}`;
  return (
    <>
      <div class="pickup-head">
        <h2>Pick up here</h2>
        <span class="sub" id="pickup-sub">
          {sub}
        </span>
      </div>
      <div class="pickup-cards" id="pickup-cards">
        {list.map((p) => (
          <PickupRow key={p.taskId} p={p} />
        ))}
      </div>
    </>
  );
}
