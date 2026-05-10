// Phase 8: the Plan tab is now a live planner-chat against the task's
// on-disk history (`~/.forge/specs/<taskId>/plan-history.json`). The
// chat panel hydrates from the server, streams replies via SSE, and
// persists each turn back to disk.
import type { TaskView } from "../../../types";
import { PlannerChat } from "../../chat/PlannerChat";

export function PlanTab({ t }: { t: TaskView }) {
  // Pass repoRoot explicitly even though the spec-scope server resolves
  // it from the task record — keeps the prop contract symmetrical with
  // the draft-scope mount in NewSpecModal.
  return <PlannerChat scope="spec" id={t.id} repoRoot={t.repoRoot} />;
}
