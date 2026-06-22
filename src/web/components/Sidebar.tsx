import { useComputed } from "@preact/signals";
import {
  enterActivityMode,
  enterLibraryMode,
  enterPrMode,
  enterSettingsMode,
  enterTaskMode,
  enterUsageMode,
  enterWorktreesMode,
} from "../lib/modes";
import { showToast } from "../lib/toast";
import { sidebarCollapsed, toggleSidebar } from "../signals/layout";
import { refreshLibrary } from "../signals/library";
import { repos } from "../signals/repos";
import { activityFilter, modalOpen, selectedRepo, sidebarFilter, viewMode } from "../signals/ui";
import { refreshWorktrees } from "../signals/worktrees";
import type { ActivityFilter, RepoView, SidebarFilter } from "../types";

interface NavTarget {
  id: SidebarFilter;
  label: string;
  ic: string;
  color?: string;
  alert?: boolean;
  countId?: string;
}

const NAV: NavTarget[] = [
  { id: "all", label: "Pick up here", ic: "●", color: "var(--attention)", alert: true, countId: "count-pickup" },
  { id: "running", label: "Running now", ic: "⟳", color: "var(--running)", countId: "count-running" },
  { id: "backlog", label: "Backlog", ic: "★", color: "var(--ready)", countId: "count-backlog" },
  { id: "prs", label: "Open PRs", ic: "⇪", color: "var(--primary)", countId: "count-prs" },
  { id: "done", label: "Recently done", ic: "✓", color: "var(--done)", countId: "count-done" },
];

interface ActivityChip {
  id: ActivityFilter;
  label: string;
}

const ACTIVITY_CHIPS: ActivityChip[] = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "failed", label: "Failed" },
  { id: "execution", label: "Execution" },
  { id: "critique", label: "Critique" },
  { id: "improvement", label: "Improvement" },
  { id: "drafting", label: "Drafting" },
  { id: "review", label: "Review" },
  { id: "agent:claude", label: "claude" },
  { id: "agent:codex", label: "codex" },
];

function repoKey(r: RepoView): string {
  return r.root || r.name || "";
}

export function Sidebar() {
  const selectedRepoView = useComputed<RepoView | null>(() => {
    const sel = selectedRepo.value;
    if (!sel) return null;
    return repos.value.find((r) => repoKey(r) === sel) ?? null;
  });
  const repoLabel = useComputed(() => {
    const r = selectedRepoView.value;
    if (r) return r.name;
    if (selectedRepo.value) return selectedRepo.value;
    const n = repos.value.length;
    return `${n} repo${n === 1 ? "" : "s"}`;
  });
  const branchLabel = useComputed(() => {
    const r = selectedRepoView.value;
    if (!r) return "—";
    if (r.stale) return "stale";
    return r.branch || "—";
  });

  const onNav = (target: SidebarFilter) => {
    sidebarFilter.value = target;
    if (target === "prs") {
      enterPrMode();
      return;
    }
    const SECTIONS: Record<string, string> = {
      running: "running",
      backlog: "ready",
      done: "done",
      all: "all",
    };
    const section = SECTIONS[target] || "all";
    enterTaskMode(section);
  };

  const onSettings = () => {
    sidebarFilter.value = "all";
    enterSettingsMode();
  };

  const onActivity = () => {
    sidebarFilter.value = "activity";
    enterActivityMode();
  };

  const onWorktrees = () => {
    sidebarFilter.value = "worktrees";
    enterWorktreesMode();
    void refreshWorktrees();
  };

  const onUsage = () => {
    sidebarFilter.value = "usage";
    enterUsageMode();
  };

  const onLibrary = () => {
    sidebarFilter.value = "library";
    enterLibraryMode();
    void refreshLibrary();
  };

  const onActivityChip = (id: ActivityFilter) => {
    activityFilter.value = id;
    if (viewMode.value !== "activity") {
      sidebarFilter.value = "activity";
      enterActivityMode();
    }
  };

  const onNewSpec = () => {
    modalOpen.value = true;
  };

  const onHelp = () => {
    showToast("Help: navigate with j/k or click. ⌘K focuses search.", "info");
  };

  const filter = sidebarFilter.value;
  const mode = viewMode.value;
  const collapsed = sidebarCollapsed.value;

  return (
    <aside class={`side${collapsed ? " collapsed" : ""}`}>
      <div class="brand">
        <span class="glyph" />
        <span class="brand-name">FORGE</span>
        <span class="v">workbench</span>
        <button
          type="button"
          class="side-collapse-btn"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-pressed={collapsed}
          onClick={toggleSidebar}
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>
      <button
        type="button"
        class="new-plan"
        id="new-plan-btn"
        title="Create a new spec from the Workbench"
        onClick={onNewSpec}
      >
        <span class="plus">+</span> <span class="lbl">New spec</span>
      </button>
      <nav class="nav" id="nav">
        <div class="nav-section">Workspace</div>
        {NAV.map((n) => {
          const isActive = mode === "tasks" && filter === n.id ? true : mode === "prs" && n.id === "prs";
          return (
            <button
              key={n.id}
              type="button"
              class={`nav-item${n.alert ? " alert" : ""}${isActive ? " active" : ""}`}
              data-target={n.id}
              title={n.label}
              onClick={() => onNav(n.id)}
            >
              <span class="ic" style={n.color ? `color:${n.color}` : undefined}>
                {n.ic}
              </span>
              <span class="lbl">{n.label}</span>
              {/* Legacy app.js writes the count text. dangerouslySetInnerHTML
                  with a constant empty html marks the children opaque to Preact's
                  reconciler so re-renders don't clobber legacy writes. */}
              <span class="count" id={n.countId} dangerouslySetInnerHTML={{ __html: "" }} />
            </button>
          );
        })}
        <button
          type="button"
          class={`nav-item${mode === "library" ? " active" : ""}`}
          id="nav-library"
          title="Library"
          onClick={onLibrary}
        >
          <span class="ic" style="color:var(--ready)">
            ▤
          </span>
          <span class="lbl">Library</span>
        </button>
        <div class="nav-section">Observability</div>
        <button
          type="button"
          class={`nav-item${mode === "activity" ? " active" : ""}`}
          id="nav-activity"
          title="Agent Activity"
          onClick={onActivity}
        >
          <span class="ic" style="color:var(--primary)">
            ◌
          </span>
          <span class="lbl">Agent Activity</span>
        </button>
        {mode === "activity" ? (
          <div class="nav-chips">
            {ACTIVITY_CHIPS.map((c) => (
              <button
                key={c.id}
                type="button"
                class={`nav-chip${activityFilter.value === c.id ? " active" : ""}`}
                onClick={() => onActivityChip(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
        ) : null}
        <button
          type="button"
          class={`nav-item${mode === "worktrees" ? " active" : ""}`}
          id="nav-worktrees"
          title="Worktrees"
          onClick={onWorktrees}
        >
          <span class="ic" style="color:var(--ready)">
            ⌳
          </span>
          <span class="lbl">Worktrees</span>
        </button>
        <button
          type="button"
          class={`nav-item${mode === "usage" ? " active" : ""}`}
          id="nav-usage"
          title="Usage & Cost"
          onClick={onUsage}
        >
          <span class="ic" style="color:var(--done)">
            ◈
          </span>
          <span class="lbl">Usage &amp; Cost</span>
        </button>
        <div class="nav-section">Reference</div>
        <button
          type="button"
          class={`nav-item${mode === "settings" ? " active" : ""}`}
          id="nav-settings"
          title="Settings"
          onClick={onSettings}
        >
          <span class="ic">⚙</span>
          <span class="lbl">Settings</span>
        </button>
        <button type="button" class="nav-item" id="nav-help" title="Help & shortcuts" onClick={onHelp}>
          <span class="ic">?</span>
          <span class="lbl">Help &amp; shortcuts</span>
        </button>
      </nav>
      <div class="side-foot">
        <div class="row">
          <span class="lbl">Repo</span>
          <span class="v" id="foot-repo">
            {repoLabel.value}
          </span>
        </div>
        <div class="row">
          <span class="lbl">Branch</span>
          <span class="v" id="foot-branch">
            {branchLabel.value}
          </span>
        </div>
        <div class="row">
          <span class="lbl">Last refresh</span>
          {/* Legacy app.js writes the refresh timestamp here. */}
          <span class="v" id="foot-refreshed" dangerouslySetInnerHTML={{ __html: "—" }} />
        </div>
        <div class="help">
          <span>Search</span>
          <kbd>⌘ K</kbd>
        </div>
      </div>
    </aside>
  );
}
