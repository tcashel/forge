// Phase 3 placeholder. Phase 8 replaces this with the in-browser planner
// chat. We deliberately render the legacy copy verbatim so the visual
// regression footprint is zero.
import { copyCmd } from "../../../lib/actions";
import type { TaskView } from "../../../types";

export function PlanTab({ t }: { t: TaskView }) {
  return (
    <div class="empty-pane">
      <div class="big">Planner chat lives in Claude Code today</div>
      <p>
        Open Claude Code, run plan-mode for "{t.title}", then <code>/forge-ship-plan</code> to save.
      </p>
      <p style="margin-bottom:8px">
        Browser-native planner is on the roadmap (see PR&nbsp;3 of the workbench rollout).
      </p>
      <button type="button" class="btn btn-secondary" id="plan-copy-id" onClick={() => copyCmd(t.id)}>
        Copy task id
      </button>
    </div>
  );
}
