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
export type TabId = "log" | "spec" | "plan" | "critique" | "gates";

export interface CritiqueAgentMeta {
  agent: string;
  model: string;
  status: string;
}

export interface CritiqueMeta {
  status: string;
  startedAt?: string;
  criticA?: CritiqueAgentMeta | null;
  criticB?: CritiqueAgentMeta | null;
  synthesizer?: CritiqueAgentMeta | null;
}

export interface CritiquePayload {
  meta: CritiqueMeta;
  recommendations: string | null;
  criticA: string | null;
  criticB: string | null;
  synth: string | null;
}

export interface QualityResult {
  command: string;
  ok: boolean;
  durationMs: number;
}
