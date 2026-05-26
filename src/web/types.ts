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
  lastImproveError: LastImproveError | null;
}

export interface LastImproveError {
  mode: string;
  error: string;
  at: string;
}

// Mirror of the per-attempt projection returned by GET /api/tasks/:id/critiques.
export interface CritiqueAttemptSummary {
  id: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  viewedAt: string | null;
  criticA: CritiqueAgentMeta | null;
  criticB: CritiqueAgentMeta | null;
  synthesizer: CritiqueAgentMeta | null;
}

// Mirror of GET /api/agents/models — { claude: [...], codex: [...], ... }
export type AgentName = "claude" | "codex" | "opencode" | "gemini";
export type AgentModelRegistry = Record<AgentName, readonly string[]>;

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

// Mirror of GhPr from src/core/gh-pr.ts. Returned by GET /api/prs as
// `{ prs: PrView[]; me: string; repo: string|null; repoRoot: string|null }`.
export interface PrView {
  number: number;
  title: string;
  headRefName: string;
  baseRefName: string;
  url: string;
  isDraft: boolean;
  statusCheckRollup: string | null;
  reviewDecision: string | null;
  author: string;
  updatedAt: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  commentsCount: number;
  reviewsCount: number;
  isMine: boolean;
}

export interface PrsResponse {
  prs: PrView[];
  me: string;
  repo: string | null;
  repoRoot: string | null;
}

// ─── Plan chat ──────────────────────────────────────────────────────────────
// Mirror of `ChatMessage` from src/core/plan-chat.ts. The web layer only
// needs the structural shape; the role union is intentionally narrowed
// to "user" | "assistant" since that's what the backend persists.
//
// `blocks` is the ordered sequence of text + tool_use + tool_result
// segments emitted by claude in stream-json mode. Older histories
// (persisted before stream-json was wired up) won't have it — renderers
// fall back to plain `text` in that case.
export type ChatBlock =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: unknown }
  | { type: "tool_result"; toolUseId: string; output: string; isError: boolean; truncated?: boolean };

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  ts: string;
  blocks?: ChatBlock[];
}

export interface PlanHistoryResponse {
  messages: ChatMessage[];
}

export interface PlanDraftResponse {
  draftId: string;
}
