// Phase 8: the Plan tab is now a live planner-chat against the task's
// on-disk history (`~/.forge/specs/<planId>/plan-history.json`). The
// chat panel hydrates from the server, streams replies via SSE, and
// persists each turn back to disk.

import { useState } from "preact/hooks";
import { refreshTasks } from "../../../signals/tasks";
import type { PlanView } from "../../../types";
import { PlannerChat } from "../../chat/PlannerChat";
import { PlanDocumentPane } from "./PlanDocumentPane";

export function PlanTab({ t }: { t: PlanView }) {
  const [docRefreshKey, setDocRefreshKey] = useState(0);
  function handlePlanUpdated(): void {
    setDocRefreshKey((n) => n + 1);
    void refreshTasks();
  }
  // Pass repoRoot explicitly even though the spec-scope server resolves
  // it from the task record — keeps the prop contract symmetrical with
  // the draft-scope mount in NewSpecModal.
  return (
    <div class="plan-workspace">
      <div class="plan-workspace-chat">
        <PlannerChat scope="spec" id={t.id} repoRoot={t.repoRoot} onPlanUpdated={handlePlanUpdated} />
      </div>
      <div class="plan-workspace-doc">
        <PlanDocumentPane t={t} refreshKey={docRefreshKey} />
      </div>
    </div>
  );
}
