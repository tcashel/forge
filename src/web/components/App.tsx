import { viewMode } from "../signals/ui";
import { ActivityView } from "./activity/ActivityView";
import { NewSpecModal } from "./modal/NewSpecModal";
import { PickupSection } from "./pickup/PickupSection";
import { PrDetail } from "./prs/PrDetail";
import { PrList } from "./prs/PrList";
import { ReviewPage } from "./review/ReviewPage";
import { Sidebar } from "./Sidebar";
import { SettingsForm } from "./settings/SettingsForm";
import { SettingsRepoList } from "./settings/SettingsRepoList";
import { Topbar } from "./Topbar";
import { PlanDetail } from "./tasks/PlanDetail";
import { PlanList } from "./tasks/PlanList";
import { UsageView } from "./usage/UsageView";
import { WorktreeList } from "./worktrees/WorktreeList";

// Phase 5: Preact now owns the pickup/list/detail panes for all three
// view modes (tasks / prs / settings). The new-spec modal is always
// rendered by Preact and toggles via the `modalOpen` signal.
//
// The outer <section> / <aside> / <main> nodes keep their `id`s so
// existing selectors (#pickup-section, #list-pane, #detail-pane) keep
// resolving — just their *children* swap based on viewMode.
//
// Pickup section is hidden in PRs and Settings modes (legacy behaviour
// hid pickup whenever the user navigated away from the tasks view).
// The PR list pane gets the `pr-list-pane` class (and detail the
// `pr-detail-pane` class) so the existing styles continue to apply.

export function App() {
  const mode = viewMode.value;
  const inTasks = mode === "tasks";
  const inPrs = mode === "prs";
  const inSettings = mode === "settings";
  const inActivity = mode === "activity";
  const inReview = mode === "pr-review";
  const inWorktrees = mode === "worktrees";
  const inUsage = mode === "usage";
  const listPaneClass = `list-pane${inPrs ? " pr-list-pane" : ""}${inActivity ? " activity-list-pane" : ""}`;
  const detailPaneClass = `detail-pane${inPrs ? " pr-detail-pane" : ""}${inActivity ? " activity-detail-pane" : ""}`;
  return (
    <div class="app">
      <Sidebar />
      <Topbar />
      <div class="workspace-body">
        <section class="pickup" id="pickup-section">
          {inTasks ? <PickupSection /> : null}
        </section>
        {inActivity ? (
          <main class={`activity-full-pane`} id="detail-pane">
            <ActivityView />
          </main>
        ) : inReview ? (
          <main class="review-full-pane" id="detail-pane">
            <ReviewPage />
          </main>
        ) : inWorktrees ? (
          <main class="worktrees-full-pane" id="detail-pane">
            <WorktreeList />
          </main>
        ) : inUsage ? (
          <main class="usage-full-pane" id="detail-pane">
            <UsageView />
          </main>
        ) : (
          <>
            <aside class={listPaneClass} id="list-pane">
              {inTasks ? <PlanList /> : null}
              {inPrs ? <PrList /> : null}
              {inSettings ? <SettingsRepoList /> : null}
            </aside>
            <main class={detailPaneClass} id="detail-pane">
              {inTasks ? <PlanDetail /> : null}
              {inPrs ? <PrDetail /> : null}
              {inSettings ? <SettingsForm /> : null}
            </main>
          </>
        )}
      </div>
      <NewSpecModal />
    </div>
  );
}
