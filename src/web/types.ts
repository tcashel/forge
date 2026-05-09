// Mirror of TaskView/RepoView shapes from src/cli/cmd/serve.ts.
// Phase 2 only needs RepoView; TaskView is stubbed for later phases.

export type WorkbenchSection = "running" | "attention" | "ready" | "drafting" | "done";

export interface RepoView {
  name: string;
  root: string;
  branch: string | null;
  taskCount: number;
  registered: boolean;
  current: boolean;
  reachable: boolean;
  hasGit: boolean;
  stale: boolean;
}

export interface CritiqueRef {
  id: string;
  status: string;
  viewedAt: string | null;
}

export interface TaskView {
  id: string;
  title: string;
  status: string;
  section: WorkbenchSection;
  statLabel: string;
  statClass: WorkbenchSection;
  kind?: "critique-ready" | "failed";
  branch: string;
  agent: string | null;
  agentLabel: string | null;
  repo: string;
  repoRoot: string;
  repoReachable: boolean;
  repoHasGit: boolean;
  repoStale: boolean;
  blurb: string | null;
  age: string;
  ageMs: number;
  prUrl: string | null;
  prNumber: number | null;
  error: string | null;
  tmuxAlive: boolean;
  hasSpec: boolean;
  hasLog: boolean;
  critique: CritiqueRef | null;
}

export interface WorkbenchContext {
  currentRepo: { name: string; root: string } | null;
}

export type ViewMode = "tasks" | "prs" | "settings";
export type SidebarFilter = "all" | "running" | "backlog" | "prs" | "done";
export type Theme = "light" | "dark";
