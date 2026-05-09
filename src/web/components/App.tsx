import { viewMode } from "../signals/ui";
import { PickupSection } from "./pickup/PickupSection";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { TaskDetail } from "./tasks/TaskDetail";
import { TaskList } from "./tasks/TaskList";

// Phase 3: Preact owns the pickup/list/detail panes when in tasks mode.
// In PRs and Settings modes the Preact subtrees collapse to `null` and
// legacy prs.js / settings.js paint into the now-empty panes via
// `pane.innerHTML = ...`. Because Preact unmounts synchronously during a
// signal-driven re-render, by the time legacy code calls `innerHTML =`
// the panes are guaranteed to be empty Preact-managed nodes — the
// legacy write replaces their content cleanly. When tasks mode is
// re-entered, viewMode flips back to "tasks" and Preact re-mounts.
//
// The outer <section> / <aside> / <main> nodes keep their `id`s so
// existing legacy selectors (#pickup-section, #list-pane, #detail-pane)
// keep resolving — just their *children* swap between Preact-rendered
// task content and legacy-rendered prs/settings markup.

export function App() {
  const inTasks = viewMode.value === "tasks";
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
        </aside>
        <main class="detail-pane" id="detail-pane">
          {inTasks ? <TaskDetail /> : null}
        </main>
      </div>
    </div>
  );
}
