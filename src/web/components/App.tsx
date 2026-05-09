import { viewMode } from "../signals/ui";
import { NewSpecModal } from "./modal/NewSpecModal";
import { PickupSection } from "./pickup/PickupSection";
import { Sidebar } from "./Sidebar";
import { SettingsForm } from "./settings/SettingsForm";
import { SettingsRepoList } from "./settings/SettingsRepoList";
import { Topbar } from "./Topbar";
import { TaskDetail } from "./tasks/TaskDetail";
import { TaskList } from "./tasks/TaskList";

// Phase 4: Preact owns the pickup/list/detail panes when in tasks OR
// settings mode. PRs mode still falls back to the legacy renderer
// (Phase 5 will port it). The new-spec modal is always rendered by
// Preact and toggles via the `modalOpen` signal — no more inline
// markup in index.html.
//
// The outer <section> / <aside> / <main> nodes keep their `id`s so
// existing legacy selectors (#pickup-section, #list-pane, #detail-pane)
// keep resolving — just their *children* swap between Preact-rendered
// content (tasks/settings) and the legacy-rendered prs/* markup.

export function App() {
  const mode = viewMode.value;
  const inTasks = mode === "tasks";
  const inSettings = mode === "settings";
  return (
    <div class="app">
      <Sidebar />
      <Topbar />
      <div class="workspace-body">
        <section class="pickup" id="pickup-section">
          {inTasks ? <PickupSection /> : null}
        </section>
        <aside class="list-pane" id="list-pane">
          {inTasks ? <TaskList /> : null}
          {inSettings ? <SettingsRepoList /> : null}
        </aside>
        <main class="detail-pane" id="detail-pane">
          {inTasks ? <TaskDetail /> : null}
          {inSettings ? <SettingsForm /> : null}
        </main>
      </div>
      <NewSpecModal />
    </div>
  );
}
