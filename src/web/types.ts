// Mirror of PlanView/RepoView shapes from src/cli/cmd/serve.ts.
// Phase 2 only needs RepoView; PlanView is stubbed for later phases.

export type WorkbenchSection = "running" | "attention" | "ready" | "drafting" | "done";

export interface RepoView {
  name: string;
  root: string;
  branch: string | null;
  planCount: number;
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

export interface PlanView {
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
  /**
   * Provenance snapshot — currently only attached to "ready" plans so the
   * sidebar can show "v2 · launched 2× — last: failed" without an extra
   * round trip. Phase 4e of COO-84; expand if other sections want it.
   */
  provenance: PlanProvenance | null;
}

export interface PlanProvenance {
  specVersion: number;
  priorRuns: number;
  lastRunState: string | null;
}

export interface LastImproveError {
  mode: string;
  error: string;
  at: string;
}

// Mirror of the per-attempt projection returned by GET /api/plans/:id/critiques.
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

export type ViewMode = "tasks" | "prs" | "settings" | "activity" | "pr-review";
export type SidebarFilter = "all" | "running" | "backlog" | "prs" | "done" | "activity";

// ─── Agent Activity ─────────────────────────────────────────────────────────

export type ActivityFilter =
  | "all"
  | "live"
  | "failed"
  | "execution"
  | "critique"
  | "synthesis"
  | "improvement"
  | "drafting"
  | "review"
  | "fix"
  | "agent:claude"
  | "agent:codex"
  | "agent:opencode"
  | "agent:gemini";

export interface AgentActivityRow {
  id: string;
  purpose: string;
  relatedId: string | null;
  agentAdapter: string;
  model: string | null;
  startedAt: string;
  finishedAt: string | null;
  state: string;
  exitCode: number | null;
  metrics: {
    durationMs?: number | null;
    tokensIn?: number | null;
    tokensOut?: number | null;
    cacheRead?: number | null;
    cacheCreate?: number | null;
    costUsd?: number | null;
    costSource?: "provider" | "estimate" | null;
    modelPricedAt?: string | null;
    planId?: string;
    scopeKind?: "draft" | "spec";
    reasoningEffort?: string | null;
  };
  jobRunNumber: number | null;
  branchName: string | null;
  plan: { id: string; title: string; repo: string | null } | null;
}

export type ActivityDetailKind =
  | "execution"
  | "critique"
  | "synthesis"
  | "improvement"
  | "drafting"
  | "review"
  | "fix"
  | "unknown";

export interface ActivityDetailResponse {
  session: AgentActivityRow;
  detail:
    | { kind: "execution"; logStreamUrl: string }
    | { kind: "review"; logStreamUrl: string }
    | { kind: "fix"; logStreamUrl: string }
    | { kind: "critique"; markdownContent: string | null; markdownPath: string | null }
    | { kind: "synthesis"; markdownContent: string | null; markdownPath: string | null }
    | { kind: "improvement"; markdownContent: string | null; markdownPath: string | null; diffPath: string | null }
    | { kind: "drafting"; planHistory: ChatMessage[] }
    | { kind: "unknown" };
}
export type Theme = "light" | "dark";
export type TabId = "log" | "spec" | "plan" | "critique" | "gates" | "history" | "runs";

export type PlanHistoryEventKind =
  | "spec_saved"
  | "critique_started"
  | "critique_synthesized"
  | "launch_started"
  | "launch_completed";

export interface PlanHistoryEvent {
  ts: string;
  kind: PlanHistoryEventKind;
  ref: string;
  summary: string;
}

export interface JobView {
  id: string;
  run_number: number;
  run_kind: string;
  state: string;
  branch_name: string | null;
  worktree_path: string | null;
  started_at: string | null;
  finished_at: string | null;
  exit_code: number | null;
  summary: string | null;
  blocker_summary: string | null;
  session_id: string | null;
}

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

// Mirror of the per-comment shape returned by GET /api/prs/:num/review-bundle.
export interface InlinePrComment {
  id: number;
  user: string;
  body: string;
  path: string;
  position: number | null;
  originalPosition: number | null;
  line: number | null;
  originalLine: number | null;
  side: "RIGHT" | "LEFT" | null;
  startLine: number | null;
  startSide: "RIGHT" | "LEFT" | null;
  inReplyToId: number | null;
  createdAt: string;
  updatedAt: string;
  htmlUrl: string;
  commitId: string;
}

export interface IssuePrComment {
  id: number;
  user: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  htmlUrl: string;
}

export interface PrBundleWarning {
  source: "diff" | "inlineComments" | "issueComments" | "linkage";
  message: string;
}

export interface PrReviewBundle {
  pr: PrView;
  diff: string;
  diffStats: { additions: number; deletions: number; changedFiles: number };
  inlineComments: InlinePrComment[];
  issueComments: IssuePrComment[];
  linkedPlanId: string | null;
  worktreePath: string | null;
  warnings: PrBundleWarning[];
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
