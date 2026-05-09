// Phase 8: the Plan tab is now a live planner-chat against the task's
// on-disk history (`~/.forge/specs/<taskId>/plan-history.json`). The
// chat panel hydrates from the server, streams replies via SSE, and
// persists each turn back to disk.
import type { TaskView } from "../../../types";
import { PlannerChat } from "../../chat/PlannerChat";

export function PlanTab({ t }: { t: TaskView }) {
  return <PlannerChat scope="spec" id={t.id} />;
}
