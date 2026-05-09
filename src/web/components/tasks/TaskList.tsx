import { useComputed } from "@preact/signals";
import { repos } from "../../signals/repos";
import { visibleTasks } from "../../signals/tasks";
import { searchQuery, selectedRepo } from "../../signals/ui";
import type { TaskView, WorkbenchSection } from "../../types";
import { DoneSection, TaskSection } from "./TaskSection";

interface SectionMap {
  running: TaskView[];
  attention: TaskView[];
  ready: TaskView[];
  drafting: TaskView[];
  done: TaskView[];
}

function bucketize(tasks: TaskView[]): SectionMap {
  const map: SectionMap = { running: [], attention: [], ready: [], drafting: [], done: [] };
  for (const t of tasks) {
    const bucket = t.section as WorkbenchSection;
    if (map[bucket]) map[bucket].push(t);
  }
  return map;
}

function selectedRepoLabel(repoList: { root: string; name: string }[], sel: string): string {
  if (!sel) return "";
  const r = repoList.find((x) => x.root === sel || x.name === sel);
  return r ? r.name : sel;
}

function EmptyState() {
  const sel = selectedRepo.value;
  const q = searchQuery.value;
  const label = selectedRepoLabel(repos.value, sel);
  if (q) {
    return (
      <div class="empty-state" style="padding:32px 12px;color:var(--dim);font-size:13px;text-align:center">
        No tasks match <b style="color:var(--text-2)">"{q}"</b>.{" "}
        <button
          type="button"
          id="empty-clear-search"
          style="margin-left:6px;color:var(--primary);background:transparent;border:0;cursor:pointer;font:inherit"
          onClick={() => {
            searchQuery.value = "";
          }}
        >
          Clear search
        </button>
      </div>
    );
  }
  if (sel) {
    return (
      <div class="empty-state" style="padding:32px 12px;color:var(--dim);font-size:13px;text-align:center">
        No tasks in <b style="color:var(--text-2)">{label || sel}</b>. Save a spec from a shell:
        <br />
        <code style="display:inline-block;margin-top:8px;color:var(--text-2);background:var(--panel-2);padding:4px 8px;border-radius:4px">
          cat plan.md | forge spec save -
        </code>
      </div>
    );
  }
  return (
    <div class="empty-state" style="padding:32px 12px;color:var(--dim);font-size:13px;text-align:center">
      No tasks yet. Click <b style="color:var(--text-2)">+ New spec</b> in the sidebar (or{" "}
      <code style="background:var(--panel-2);padding:2px 6px;border-radius:4px">cat plan.md | forge spec save -</code>{" "}
      from a shell).
    </div>
  );
}

export function TaskList() {
  const buckets = useComputed(() => bucketize(visibleTasks.value));
  const map = buckets.value;
  const total = map.running.length + map.attention.length + map.ready.length + map.drafting.length + map.done.length;
  return (
    <>
      <TaskSection
        section="running"
        ic="running"
        name="Running now"
        help="Live — auto-refreshes every 3s"
        rows={map.running}
      />
      <TaskSection
        section="attention"
        ic="attention"
        name="Needs your attention"
        help="Failures + critique-ready"
        rows={map.attention}
      />
      <TaskSection
        section="ready"
        ic="ready"
        name="Ready to launch"
        help="Auto-improver has revised these"
        rows={map.ready}
      />
      <TaskSection
        section="drafting"
        ic="drafting"
        name="Drafting"
        help="First-pass specs — could use shape"
        rows={map.drafting}
      />
      <DoneSection rows={map.done} />
      {total === 0 ? <EmptyState /> : null}
    </>
  );
}
