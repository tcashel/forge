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
  openQuestionCount: number;
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

export type ViewMode = "tasks" | "prs" | "settings" | "activity" | "pr-review" | "worktrees" | "usage" | "library";
export type SidebarFilter =
  | "all"
  | "running"
  | "backlog"
  | "prs"
  | "done"
  | "activity"
  | "worktrees"
  | "usage"
  | "library";

// ─── Spec library (GET /api/spec-library) ───────────────────────────────────

export type LibraryFilter = "drafts" | "archived" | "all";

/** One row in the spec library — metadata only; the body is fetched on open. */
export interface LibrarySpec {
  id: string;
  title: string;
  repo: string;
  repoRoot: string;
  createdAt: string;
  specVersion: number;
  openQuestionCount: number;
  status: string;
  hasSpec: boolean;
}

export interface SpecLibraryResponse {
  specs: LibrarySpec[];
}

// ─── Usage dashboard ────────────────────────────────────────────────────────

export type UsageWindow = "7d" | "30d" | "90d" | "all";

/** Active Usage dashboard filters; the time window plus the cross-filters. */
export interface UsageFilterState {
  window: UsageWindow;
  repo?: string;
  spec?: string;
  model?: string;
  agent?: string;
  purpose?: string;
}

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
  /**
   * Cheap snapshot of the Forge-managed worktree linked to this PR.
   * Null when there is no managed worktree (chip will render "will rehydrate
   * on fix"). Computed without network I/O — full safety verdict (with PR
   * state) lives in GET /api/worktrees.
   */
  worktree: WorktreeChipInfo | null;
}

export type WorktreeSafety = "unmanaged" | "in-use" | "unsafe" | "safe" | "removable" | "unknown";
export type WorktreePrState = "open" | "merged" | "closed" | "unknown" | "unlinked";

export interface WorktreeChipInfo {
  path: string;
  safety: WorktreeSafety;
  reason: string;
}

export interface WorktreeEntry {
  path: string;
  branch: string | null;
  head: string;
  prNumber: number | null;
  prState: WorktreePrState;
  planId: string | null;
  dirty: boolean;
  unpushed: boolean;
  unpushedReason: string | null;
  inFlight: boolean;
  managed: boolean;
  safety: WorktreeSafety;
  reason: string;
}

export interface WorktreesResponse {
  worktrees: WorktreeEntry[];
  repo: string | null;
  repoRoot: string | null;
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
  /** Set when this comment is the published view of a Forge finding. */
  forgeFindingId?: string;
  /** GraphQL review-thread node id (null when no thread matched). */
  reviewThreadId?: string | null;
  /** Whether the finding's review thread is resolved (ground truth or fallback). */
  isResolved?: boolean;
}

export interface IssuePrComment {
  id: number;
  user: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  htmlUrl: string;
}

// Mirror of `PrReview` from src/core/gh-pr.ts — submitted review summaries
// (top-level body text from human/AI reviewers).
export interface PrReview {
  id: number;
  user: string;
  state: "APPROVED" | "CHANGES_REQUESTED" | "COMMENTED";
  body: string;
  submittedAt: string | null;
  htmlUrl: string;
}

export interface PrBundleWarning {
  source: "diff" | "inlineComments" | "issueComments" | "prReviews" | "linkage";
  message: string;
}

export type ForgeFindingSeverity = "BLOCKER" | "HIGH" | "MEDIUM" | "LOW";

export interface ForgeFinding {
  id: string;
  severity: ForgeFindingSeverity;
  title: string;
  file: string;
  lineStart: number;
  lineEnd: number;
  evidence: string | null;
  why: string;
  fix: string;
}

export type CommentFixStatus = "fixed" | "disputed" | "failed";

export interface CommentFixStateEntry {
  status: CommentFixStatus;
  reason?: string;
  ghResolved?: boolean;
  /** First-line detail when the GitHub write (resolve/dispute-reply) failed. */
  ghError?: string;
}

export type CommentFixState = Record<string, CommentFixStateEntry>;

export interface PrReviewBundle {
  pr: PrView;
  diff: string;
  diffStats: { additions: number; deletions: number; changedFiles: number };
  inlineComments: InlinePrComment[];
  issueComments: IssuePrComment[];
  prReviews: PrReview[];
  linkedPlanId: string | null;
  worktreePath: string | null;
  forgeFindings: ForgeFinding[];
  commentFixState: CommentFixState;
  warnings: PrBundleWarning[];
}

// ─── Forge review history (GET /api/prs/:num/reviews) ───────────────────────

export type ReviewRunStatus = "running" | "completed" | "failed" | "killed";
export type ReviewVerdict = "approve" | "request-changes" | "block";

// Mirror of FindingPublishOutcome / PublishRecord from src/core/publish-record.ts.
export type FindingPublishStatus = "posted" | "already-published" | "out-of-diff-posted" | "failed";

export interface FindingPublishOutcome {
  id: string;
  status: FindingPublishStatus;
  error?: string;
}

export type PublishState = "published" | "partial" | "failed" | "nothing-new" | "not-requested" | "reconcile-failed";

export interface PublishRecord {
  schemaVersion: 1;
  requested: boolean;
  attemptedAt: string | null;
  state: PublishState;
  posted: number;
  outOfDiff: number;
  skipped: number;
  failed: number;
  error: string | null;
  findings: FindingPublishOutcome[];
  /** Set when the PR head moved between review start and publish. */
  headMoved?: boolean;
}

export interface ReviewSeverityCounts {
  BLOCKER: number;
  HIGH: number;
  MEDIUM: number;
  LOW: number;
}

export interface ReviewRunSummary {
  sessionId: string;
  agent: string;
  model: string | null;
  startedAt: string;
  completedAt: string | null;
  status: ReviewRunStatus;
  verdict: ReviewVerdict | null;
  findingsTotal: number;
  findingCounts: ReviewSeverityCounts;
  /** Publish outcome from publish.json; null for pre-publish-record runs. */
  publish: PublishRecord | null;
}

export interface ReviewRunDetail {
  sessionId: string;
  status: ReviewRunStatus;
  agent: string;
  model: string | null;
  startedAt: string;
  completedAt: string | null;
  verdict: ReviewVerdict | null;
  summary: string;
  findings: ForgeFinding[];
  /** Publish outcome from publish.json; null for pre-publish-record runs. */
  publish: PublishRecord | null;
}

/** An operator-selected fix target the server could not match on the PR. */
export interface DroppedFixTarget {
  token: string;
  reason: string;
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

export type PlanSectionKey =
  | "goals"
  | "constraints"
  | "non_goals"
  | "approach"
  | "risks"
  | "open_questions"
  | "acceptance_criteria";

export interface PlanSectionDoc {
  key: PlanSectionKey;
  title: string;
  content: string;
  present: boolean;
}

export interface PendingPlanEdit {
  id: string;
  planId: string;
  baseVersion: number;
  diff: string;
  createdBy: "agent:planner" | "user";
  note: string | null;
  createdAt: string;
  updatedAt: string;
  openQuestions: string[];
}

export interface PlanWorkspaceResponse {
  planId: string;
  specVersion: number;
  body: string;
  parsed: {
    title: string | null;
    sections: Record<PlanSectionKey, PlanSectionDoc>;
    openQuestions: string[];
  };
  openQuestionCount: number;
  pendingEdit: PendingPlanEdit | null;
}

export interface PlanDraftResponse {
  draftId: string;
}
