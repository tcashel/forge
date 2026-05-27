import { useComputed } from "@preact/signals";
import { repos } from "../../signals/repos";
import { visibleTasks } from "../../signals/tasks";
import { searchQuery, selectedRepo, sidebarFilter } from "../../signals/ui";
import type { PlanView, SidebarFilter, WorkbenchSection } from "../../types";
import { DoneSection, PlanSection } from "./PlanSection";

// Which task sections each sidebar filter surfaces. "all" (Pick up here)
// keeps the original always-show-everything behaviour. The others narrow
// the list so the sidebar nav actually feels like a filter, not just a
// scroll-to-header anchor (which is what it used to be).
const FILTER_SECTIONS: Record<SidebarFilter, Set<WorkbenchSection> | "all"> = {
  all: "all",
  running: new Set<WorkbenchSection>(["running"]),
  backlog: new Set<WorkbenchSection>(["ready", "drafting", "attention"]),
  done: new Set<WorkbenchSection>(["done"]),
  prs: "all", // unreachable here — prs flips viewMode, not just the filter
};

function shouldRender(section: WorkbenchSection, filter: SidebarFilter): boolean {
  const set = FILTER_SECTIONS[filter];
  return set === "all" || set.has(section);
}

interface SectionMap {
  running: PlanView[];
  attention: PlanView[];
  ready: PlanView[];
  drafting: PlanView[];
  done: PlanView[];
}

function bucketize(tasks: PlanView[]): SectionMap {
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

export function PlanList() {
  const buckets = useComputed(() => bucketize(visibleTasks.value));
  const map = buckets.value;
  const filter = sidebarFilter.value;
  const visibleCount =
    (shouldRender("running", filter) ? map.running.length : 0) +
    (shouldRender("attention", filter) ? map.attention.length : 0) +
    (shouldRender("ready", filter) ? map.ready.length : 0) +
    (shouldRender("drafting", filter) ? map.drafting.length : 0) +
    (shouldRender("done", filter) ? map.done.length : 0);
  return (
    <>
      {shouldRender("running", filter) ? (
        <PlanSection
          section="running"
          ic="running"
          name="Running now"
          help="Live — auto-refreshes every 3s"
          rows={map.running}
        />
      ) : null}
      {shouldRender("attention", filter) ? (
        <PlanSection
          section="attention"
          ic="attention"
          name="Needs your attention"
          help="Failures + critique-ready"
          rows={map.attention}
        />
      ) : null}
      {shouldRender("ready", filter) ? (
        <PlanSection
          section="ready"
          ic="ready"
          name="Ready to launch"
          help="Auto-improver has revised these"
          rows={map.ready}
        />
      ) : null}
      {shouldRender("drafting", filter) ? (
        <PlanSection
          section="drafting"
          ic="drafting"
          name="Drafting"
          help="First-pass specs — could use shape"
          rows={map.drafting}
        />
      ) : null}
      {shouldRender("done", filter) ? <DoneSection rows={map.done} /> : null}
      {visibleCount === 0 ? <EmptyState /> : null}
    </>
  );
}
