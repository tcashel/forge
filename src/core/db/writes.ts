/**
 * Phase 3 dual-write helpers — call sites in saveSpec / improver / launch
 * invoke these alongside the existing JSON writes so the SQLite contract
 * stays current. Phase 5 drops the JSON mirror; these stay.
 *
 * Live-write IDs use no prefix (`pv-…`, `t-…`, `j-…`). Backfill IDs use
 * `bf-…`. The two never collide: backfill runs against existing tasks
 * that have already passed through saveSpec, and saveSpec mints a fresh
 * task id every call.
 */

import type { Database } from "bun:sqlite";
import { openQuestionsJson, sectionsJson } from "../plan-document.ts";
import type { CostSource } from "../pricing.ts";
import type { CritiqueMeta, Plan, RunMeta } from "../store.ts";

/**
 * On-disk shape stored as JSON in `sessions.metrics`. Only this file
 * mints and updates these rows; the Agent Activity view reads them back
 * as `unknown` and parses leniently — older rows (`metrics='{}'`) must
 * keep rendering.
 */
export interface SessionMetrics {
  durationMs: number | null;
  reasoningEffort: "low" | "medium" | "high" | null;
  tokensIn: number | null;
  tokensOut: number | null;
  cacheRead: number | null;
  cacheCreate: number | null;
  costUsd: number | null;
  costSource: CostSource | null;
  /** ISO date — populated only when costSource === "estimate". */
  modelPricedAt: string | null;
  /** Joinable plan id when known (improvement, drafting after promotion, …). */
  planId?: string;
  /** Drafting only — "draft" until promotion, then "spec". */
  scopeKind?: "draft" | "spec";
}

export type SessionPurpose =
  | "drafting"
  | "critique"
  | "synthesis"
  | "execution"
  | "review"
  | "fix"
  | "comment-fix"
  | "improvement";

export type SessionState = "running" | "completed" | "failed" | "killed";

export interface UpsertSessionInput {
  id: string;
  purpose: SessionPurpose;
  relatedId: string | null;
  agentAdapter: string;
  model: string | null;
  startedAt: string;
  pid?: number | null;
  cwd?: string | null;
  commandLine?: string | null;
  /** Initial state — defaults to "running". */
  state?: SessionState;
  metrics?: Partial<SessionMetrics>;
}

export interface FinalizeSessionInput {
  id: string;
  finishedAt: string;
  state: SessionState;
  exitCode?: number | null;
  error?: string | null;
  metrics?: Partial<SessionMetrics>;
}

function defaultMetrics(): SessionMetrics {
  return {
    durationMs: null,
    reasoningEffort: null,
    tokensIn: null,
    tokensOut: null,
    cacheRead: null,
    cacheCreate: null,
    costUsd: null,
    costSource: null,
    modelPricedAt: null,
  };
}

function mergeMetrics(base: SessionMetrics, patch: Partial<SessionMetrics> | undefined): SessionMetrics {
  if (!patch) return base;
  return { ...base, ...patch };
}

function parseMetrics(raw: string | null | undefined): SessionMetrics {
  if (!raw) return defaultMetrics();
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return { ...defaultMetrics(), ...(parsed as Partial<SessionMetrics>) };
  } catch {
    return defaultMetrics();
  }
}

/**
 * Insert-or-update a sessions row keyed by deterministic `id`. Re-runs
 * with the same id replace the prior row's mutable fields (state,
 * metrics, …) so callers don't need to track "did I already start this
 * session?" across processes. New ids (e.g. round 2 of a fixer)
 * naturally land as new rows.
 */
export function upsertSession(db: Database, input: UpsertSessionInput): void {
  const merged = mergeMetrics(defaultMetrics(), input.metrics);
  const state = input.state ?? "running";
  // Re-running a deterministic id (e.g. fixer round n bumped to n again
  // after a crash) must drop stale terminal fields when the caller is
  // starting a fresh run — otherwise live duration and status semantics
  // show a running session with last run's finished_at / exit_code.
  // Caller intent: a terminal state passed in means "record a finalized
  // row" (rare on insert), so we only clear when entering a non-terminal
  // state.
  const clearTerminal = state === "running";
  db.prepare(
    `INSERT INTO sessions
     (id, purpose, related_id, agent_adapter, model, started_at, finished_at, state,
      pid, cwd, command_line, exit_code, error, metrics)
     VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, NULL, NULL, ?)
     ON CONFLICT(id) DO UPDATE SET
       purpose = excluded.purpose,
       related_id = excluded.related_id,
       agent_adapter = excluded.agent_adapter,
       -- Never let a null re-upsert (e.g. the launch-time seed that runs
       -- before the resolved model is persisted) blank a model the runner
       -- already recorded. See recordJobStarted for the race this guards.
       model = COALESCE(excluded.model, sessions.model),
       started_at = excluded.started_at,
       state = excluded.state,
       pid = excluded.pid,
       cwd = excluded.cwd,
       command_line = excluded.command_line,
       metrics = excluded.metrics,
       finished_at = CASE WHEN ? = 1 THEN NULL ELSE sessions.finished_at END,
       exit_code   = CASE WHEN ? = 1 THEN NULL ELSE sessions.exit_code END,
       error       = CASE WHEN ? = 1 THEN NULL ELSE sessions.error END`,
  ).run(
    input.id,
    input.purpose,
    input.relatedId,
    input.agentAdapter,
    input.model,
    input.startedAt,
    state,
    input.pid ?? null,
    input.cwd ?? null,
    input.commandLine ?? null,
    JSON.stringify(merged),
    clearTerminal ? 1 : 0,
    clearTerminal ? 1 : 0,
    clearTerminal ? 1 : 0,
  );
}

/**
 * Finalize a session row — set finished_at / state / exit_code / error
 * and merge in any new metrics fields. Looks up the existing metrics
 * blob and merges patch on top so partial updates (e.g. just costUsd
 * after a stream-json parse) don't clobber durationMs already written.
 *
 * No-op if the row doesn't exist (best-effort finalize from CLI helpers
 * that may race a missing session).
 */
export function finalizeSession(db: Database, input: FinalizeSessionInput): void {
  const row = db.prepare("SELECT metrics FROM sessions WHERE id = ?").get(input.id) as
    | { metrics: string | null }
    | undefined;
  if (!row) return;
  const merged = mergeMetrics(parseMetrics(row.metrics), input.metrics);
  db.prepare(
    "UPDATE sessions SET finished_at = ?, state = ?, exit_code = ?, error = COALESCE(?, error), metrics = ? WHERE id = ?",
  ).run(input.finishedAt, input.state, input.exitCode ?? null, input.error ?? null, JSON.stringify(merged), input.id);
}

/**
 * Promote drafting sessions for `draftId` so their Activity row links to
 * the just-minted spec. Called from the draft promotion path — without
 * this, promoted drafting rows keep `scopeKind='draft'` and the Spec
 * column shows the draft slug forever.
 */
export function promoteDraftingSessions(db: Database, draftId: string, planId: string): void {
  const rows = db
    .prepare("SELECT id, metrics FROM sessions WHERE purpose = 'drafting' AND related_id = ?")
    .all(draftId) as Array<{ id: string; metrics: string | null }>;
  for (const row of rows) {
    const merged = mergeMetrics(parseMetrics(row.metrics), { planId, scopeKind: "spec" });
    // related_id is the authoritative pointer for downstream readers
    // (loadDraftingHistory, resolvePlanRefForRow). Update it too so they
    // resolve against the new spec id, not the now-deleted draft path.
    db.prepare("UPDATE sessions SET metrics = ?, related_id = ? WHERE id = ?").run(
      JSON.stringify(merged),
      planId,
      row.id,
    );
  }
}

/**
 * Sweep any `state='running'` execution sessions whose backing job row
 * shows a terminal job state. Read-path safety net for the case where
 * the bash runner dies before invoking `forge session finish` — without
 * this, the Activity view's "Live" filter shows phantom running rows.
 */
export function reconcileExecutionSessions(db: Database, now: string): void {
  db.prepare(
    `UPDATE sessions
        SET state = CASE WHEN j.state IN ('succeeded') THEN 'completed'
                         WHEN j.state IN ('failed','timeout','cancelled','hook_denied') THEN 'failed'
                         ELSE sessions.state END,
            finished_at = COALESCE(sessions.finished_at, j.finished_at, ?)
       FROM jobs j
      WHERE sessions.purpose = 'execution'
        AND sessions.state = 'running'
        AND j.session_id = sessions.id
        AND j.state IN ('succeeded','failed','timeout','cancelled','hook_denied')`,
  ).run(now);
}

export function livePlanVersionId(planId: string, version: number): string {
  return `pv-${planId}-v${version}`;
}

export function liveTaskId(planId: string): string {
  return `t-${planId}`;
}

export function liveJobId(planId: string, runNumber: number): string {
  return `j-${planId}-r${runNumber}`;
}

// ─── Deterministic session ids ────────────────────────────────────────────────
//
// Format documented in the Agent Activity spec. ActivityTable parses the
// slot suffix to derive a display label (critic-a / critic-b / …) so the
// `purpose` enum stays compact.

export function executionSessionId(jobId: string): string {
  return `s-execution-${jobId}`;
}

export function critiqueSessionId(critiqueId: string, slot: "a" | "b"): string {
  return `s-critique-${critiqueId}-${slot}`;
}

export function synthesisSessionId(critiqueId: string): string {
  return `s-synthesis-${critiqueId}`;
}

export function improvementSessionId(critiqueId: string, round: number): string {
  return `s-improvement-${critiqueId}-r${round}`;
}

export function reviewSessionId(jobId: string, round: number): string {
  return `s-review-${jobId}-r${round}`;
}

export function fixSessionId(jobId: string, round: number): string {
  return `s-fix-${jobId}-r${round}`;
}

export function draftingSessionId(scopeId: string): string {
  return `s-drafting-${scopeId}`;
}

function planStageForStatus(status: Plan["status"]): string {
  switch (status) {
    case "draft":
      return "drafting";
    case "running":
    case "quality_check":
    case "creating_pr":
    case "fixing":
      return "running";
    case "done":
    case "failed":
    case "quality_failed":
      return "completed";
    case "archived":
      return "archived";
    default:
      return "drafting";
  }
}

function taskStateForStatus(status: Plan["status"]): string {
  switch (status) {
    case "draft":
      return "ready";
    case "running":
    case "quality_check":
    case "creating_pr":
    case "fixing":
      return "running";
    case "done":
      return "completed";
    case "failed":
    case "quality_failed":
      return "failed";
    default:
      return "ready";
  }
}

function planMetadata(task: Plan): string {
  return JSON.stringify({
    repoName: task.repoName,
    worktree: task.worktree,
    agent: task.agent,
    model: task.model,
    prUrl: task.prUrl,
    prNumber: task.prNumber,
    jiraTicket: task.jiraTicket,
    tmuxSession: task.tmuxSession,
    logFile: task.logFile,
    lastImproveError: task.lastImproveError,
    originalStatus: task.status,
  });
}

/**
 * Called once when a plan first appears (saveSpec). Idempotent —
 * INSERT OR IGNORE guards against a re-save that somehow reuses an id.
 * Writes the plan row, the v1 plan_version, and the synthetic tasks
 * row (sequence=1) jobs will attach to. Sets current_version_id to v1.
 */
export function recordPlanCreated(db: Database, task: Plan, body: string): void {
  const planVersionId = livePlanVersionId(task.id, 1);
  const taskRowId = liveTaskId(task.id);
  const sections = JSON.stringify(sectionsJson(body));
  const openQuestions = openQuestionsJson(body);

  db.transaction(() => {
    db.prepare(
      `INSERT OR IGNORE INTO plans
       (id, title, repo_path, repo_branch, stage, intent, current_version_id, created_at, updated_at, metadata)
       VALUES (?, ?, ?, ?, ?, NULL, NULL, ?, ?, ?)`,
    ).run(
      task.id,
      task.title,
      task.repoRoot,
      task.branch,
      planStageForStatus(task.status),
      task.createdAt,
      task.createdAt,
      planMetadata(task),
    );

    db.prepare(
      `INSERT OR IGNORE INTO plan_versions
       (id, plan_id, version_number, document, sections, open_questions, created_by, created_at, notes)
       VALUES (?, ?, 1, ?, ?, ?, 'user', ?, NULL)`,
    ).run(
      planVersionId,
      task.id,
      body,
      sections,
      openQuestions.length > 0 ? JSON.stringify(openQuestions) : null,
      task.createdAt,
    );

    db.prepare("UPDATE plans SET current_version_id = ? WHERE id = ?").run(planVersionId, task.id);

    db.prepare(
      `INSERT OR IGNORE INTO tasks
       (id, plan_id, plan_version_id, sequence, title, spec, plan_section_refs, estimated_diff_size,
        dependencies, state, agent_preference, created_at, updated_at, started_at, completed_at)
       VALUES (?, ?, ?, 1, ?, ?, NULL, NULL, NULL, ?, ?, ?, ?, NULL, NULL)`,
    ).run(
      taskRowId,
      task.id,
      planVersionId,
      task.title,
      body,
      taskStateForStatus(task.status),
      task.agent,
      task.createdAt,
      task.createdAt,
    );
  })();
}

/**
 * Called when the auto-improver bumps specVersion. Inserts a new
 * plan_versions row, advances plans.current_version_id, and points the
 * synthetic tasks row at the new version.
 *
 * Self-heals: if the plan or synthetic task doesn't exist yet (task
 * predates dual-write, or test constructed it via upsertPlan without
 * saveSpec), they're created lazily from the Plan. The synthetic
 * task is matched by `(plan_id, sequence=1)` so backfilled IDs (`bf-t-*`)
 * and live IDs (`t-*`) both work.
 */
export function recordPlanVersionAdded(
  db: Database,
  task: Plan,
  version: number,
  body: string,
  opts: { createdBy?: string; notes?: string | null } = {},
): void {
  const planVersionId = livePlanVersionId(task.id, version);
  const now = new Date().toISOString();
  const sections = JSON.stringify(sectionsJson(body));
  const openQuestions = openQuestionsJson(body);
  const createdBy = opts.createdBy ?? "agent:improver";

  db.transaction(() => {
    ensurePlanAndSyntheticTask(db, task);

    db.prepare(
      `INSERT OR IGNORE INTO plan_versions
       (id, plan_id, version_number, document, sections, open_questions, created_by, created_at, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      planVersionId,
      task.id,
      version,
      body,
      sections,
      openQuestions.length > 0 ? JSON.stringify(openQuestions) : null,
      createdBy,
      now,
      opts.notes ?? null,
    );

    db.prepare("UPDATE plans SET current_version_id = ?, updated_at = ? WHERE id = ?").run(planVersionId, now, task.id);

    db.prepare("UPDATE tasks SET plan_version_id = ?, spec = ?, updated_at = ? WHERE plan_id = ? AND sequence = 1").run(
      planVersionId,
      body,
      now,
      task.id,
    );
  })();
}

/**
 * Insert a new `jobs` row for a launch attempt. Computes
 * `run_number = max(existing for this plan) + 1` so a second `forge
 * launch` against the same plan gets run_number=2 instead of
 * overwriting the prior run. Returns the new run_number.
 *
 * Self-heals plan + synthetic task if either is missing. Re-runs on the
 * same task always produce a fresh row (no INSERT OR IGNORE) — that's
 * the whole point of versioned jobs.
 */
export function recordJobStarted(db: Database, task: Plan, meta: RunMeta): number {
  let runNumber = 0;

  db.transaction(() => {
    ensurePlanAndSyntheticTask(db, task);

    const synthetic = db.prepare("SELECT id FROM tasks WHERE plan_id = ? AND sequence = 1").get(task.id) as {
      id: string;
    };
    const taskRowId = synthetic.id;

    const maxRow = db
      .prepare("SELECT COALESCE(MAX(run_number), 0) AS n FROM jobs WHERE task_id = ?")
      .get(taskRowId) as { n: number };
    runNumber = maxRow.n + 1;

    const jobId = liveJobId(task.id, runNumber);
    const sessionId = executionSessionId(jobId);
    // Seed the session row before the jobs row so the FK from
    // jobs.session_id holds. The bash runner's `forge session start`
    // upserts the same id with richer metadata once the agent launches.
    // Seed from `meta` (the resolved launch model/agent), NOT `task` — the
    // plan row isn't updated with the resolved model until after launchAgent
    // returns, so `task.model` is still null here and would otherwise race
    // the runner's correct value to null.
    upsertSession(db, {
      id: sessionId,
      purpose: "execution",
      relatedId: jobId,
      agentAdapter: meta.agent ?? task.agent ?? "claude",
      model: meta.model ?? task.model,
      startedAt: meta.startedAt,
      state: "running",
      cwd: meta.worktree,
    });
    db.prepare(
      `INSERT INTO jobs
       (id, task_id, run_number, run_kind, session_id, worktree_path, branch_name, state,
        blocker_summary, eta_seconds, started_at, finished_at, exit_code, summary)
       VALUES (?, ?, ?, 'initial', ?, ?, ?, 'running', NULL, NULL, ?, NULL, NULL, NULL)`,
    ).run(jobId, taskRowId, runNumber, sessionId, meta.worktree, task.branch, meta.startedAt);

    db.prepare("UPDATE plans SET stage = 'running', updated_at = ? WHERE id = ?").run(meta.startedAt, task.id);

    db.prepare("UPDATE tasks SET state = 'running', started_at = ?, updated_at = ? WHERE id = ?").run(
      meta.startedAt,
      meta.startedAt,
      taskRowId,
    );
  })();

  return runNumber;
}

function safe(s: string): string {
  return s.replace(/[^a-z0-9_-]/gi, "_");
}

function liveCriticConfigId(agent: string, model: string): string {
  return `cc-${safe(agent)}-${safe(model)}`;
}

function liveCritiqueSessionId(critiqueId: string, slot: "critic-a" | "critic-b" | "synth"): string {
  if (slot === "synth") return synthesisSessionId(critiqueId);
  return critiqueSessionId(critiqueId, slot === "critic-a" ? "a" : "b");
}

function liveCriticRunId(critiqueId: string, slot: "a" | "b"): string {
  return `cr-${critiqueId}-${slot}`;
}

function liveCritiqueSynthesisId(critiqueId: string): string {
  return `cs-${critiqueId}`;
}

function mapCritiqueAgentState(s: CritiqueMeta["criticA"]["status"]): string {
  switch (s) {
    case "done":
      return "completed";
    case "failed":
      return "failed";
    default:
      return "running";
  }
}

/**
 * Called when a critique is launched (after writeCritiqueMeta). Inserts
 * critic_configs (for the 3 agent/model pairs encountered), 3 sessions
 * (critic-a, critic-b, synth), and 2 critic_runs (a, b) pointing at the
 * plan's current_version_id.
 *
 * The critique's bash runner updates critique-meta.json directly as
 * critics complete; those state transitions get reflected in the DB via
 * `syncCritiqueState` (read-path) rather than runner-script writes.
 *
 * Idempotent — re-running on the same critiqueId is a no-op.
 */
export function recordCritiqueStarted(db: Database, task: Plan, meta: CritiqueMeta): void {
  db.transaction(() => {
    ensurePlanAndSyntheticTask(db, task);

    const planRow = db.prepare("SELECT current_version_id FROM plans WHERE id = ?").get(task.id) as {
      current_version_id: string | null;
    };
    const targetVersionId = planRow.current_version_id;
    if (!targetVersionId) return; // no version → nothing to critique against

    insertCriticConfigIfMissing(db, meta.criticA.agent, meta.criticA.model, meta.startedAt);
    insertCriticConfigIfMissing(db, meta.criticB.agent, meta.criticB.model, meta.startedAt);
    insertCriticConfigIfMissing(db, meta.synthesizer.agent, meta.synthesizer.model, meta.startedAt);

    insertCritiqueSession(db, meta, "critic-a", "critique", meta.criticA, task.id);
    insertCritiqueSession(db, meta, "critic-b", "critique", meta.criticB, task.id);
    insertCritiqueSession(db, meta, "synth", "synthesis", meta.synthesizer, task.id);

    insertLiveCriticRun(db, meta, "a", targetVersionId, meta.criticA);
    insertLiveCriticRun(db, meta, "b", targetVersionId, meta.criticB);
  })();
}

/**
 * Read-path sync — reconciles DB state with the bash runner's
 * critique-meta.json. Called by API/CLI readers before returning data
 * so finished critiques land their 'completed'/'failed' state and the
 * synthesis row appears. Idempotent.
 *
 * `opts.sidecarMetrics` carries per-slot token/cost data extracted from
 * the slot's `.stream.jsonl` sidecar (claude only). Slots without a
 * sidecar (non-claude agents, or claude runs whose sidecar was missing
 * or empty) are absent from the map — those slots keep whatever metrics
 * they already had on disk via `mergeMetrics`.
 */
export interface SidecarMetricsPatch {
  tokensIn: number | null;
  tokensOut: number | null;
  cacheRead: number | null;
  cacheCreate: number | null;
  costUsd: number | null;
  costSource: CostSource | null;
}

export interface SyncCritiqueStateOptions {
  sidecarMetrics?: Partial<Record<"criticA" | "criticB" | "synth", SidecarMetricsPatch>>;
}

export function syncCritiqueState(db: Database, meta: CritiqueMeta, opts: SyncCritiqueStateOptions = {}): void {
  db.transaction(() => {
    const finishedAt = meta.completedAt ?? null;

    // Sync the three sessions
    updateCritiqueSession(
      db,
      liveCritiqueSessionId(meta.critiqueId, "critic-a"),
      meta.criticA,
      finishedAt,
      opts.sidecarMetrics?.criticA,
    );
    updateCritiqueSession(
      db,
      liveCritiqueSessionId(meta.critiqueId, "critic-b"),
      meta.criticB,
      finishedAt,
      opts.sidecarMetrics?.criticB,
    );
    updateCritiqueSession(
      db,
      liveCritiqueSessionId(meta.critiqueId, "synth"),
      meta.synthesizer,
      finishedAt,
      opts.sidecarMetrics?.synth,
    );

    // Sync the two critic_runs
    db.prepare("UPDATE critic_runs SET state = ?, finished_at = ? WHERE id = ?").run(
      mapCritiqueAgentState(meta.criticA.status),
      meta.criticA.status === "done" || meta.criticA.status === "failed" ? finishedAt : null,
      liveCriticRunId(meta.critiqueId, "a"),
    );
    db.prepare("UPDATE critic_runs SET state = ?, finished_at = ? WHERE id = ?").run(
      mapCritiqueAgentState(meta.criticB.status),
      meta.criticB.status === "done" || meta.criticB.status === "failed" ? finishedAt : null,
      liveCriticRunId(meta.critiqueId, "b"),
    );

    // Synthesis row only appears when the synthesizer actually produced
    // output. Failed critiques have no synthesis — inserting a row with a
    // NULL recommendation would surface in history.ts:formatSynthesis as
    // the misleading literal "ready".
    if (meta.status === "done") {
      const targetRow = db
        .prepare("SELECT target_id FROM critic_runs WHERE id = ? LIMIT 1")
        .get(liveCriticRunId(meta.critiqueId, "a")) as { target_id: string } | undefined;
      const targetVersionId = targetRow?.target_id ?? null;
      if (targetVersionId) {
        db.prepare(
          `INSERT OR IGNORE INTO critic_syntheses
           (id, target_kind, target_id, critic_run_ids, agreements, disagreements, recommendation, created_at)
           VALUES (?, 'plan_version', ?, ?, NULL, NULL, NULL, ?)`,
        ).run(
          liveCritiqueSynthesisId(meta.critiqueId),
          targetVersionId,
          JSON.stringify([liveCriticRunId(meta.critiqueId, "a"), liveCriticRunId(meta.critiqueId, "b")]),
          finishedAt ?? meta.startedAt,
        );
      }
    }
  })();
}

function insertCriticConfigIfMissing(db: Database, agent: string, model: string, createdAt: string): void {
  db.prepare(
    `INSERT OR IGNORE INTO critic_configs
     (id, name, description, prompt_template, agent_adapter, model, role, enabled, created_at, updated_at)
     VALUES (?, ?, NULL, '(live — prompt loaded from skills at runtime)', ?, ?, 'plan', 1, ?, ?)`,
  ).run(liveCriticConfigId(agent, model), `${agent}:${model}`, agent, model, createdAt, createdAt);
}

function insertCritiqueSession(
  db: Database,
  meta: CritiqueMeta,
  slot: "critic-a" | "critic-b" | "synth",
  purpose: "critique" | "synthesis",
  agent: CritiqueMeta["criticA"],
  planId: string,
): void {
  // Synthesis sessions are not joinable to plans via critic_runs (only
  // critic-a/b are), so stash planId in metrics so the Activity view can
  // resolve the spec link without a fragile fallback.
  const metrics: Record<string, unknown> = { reasoningEffort: agent.reasoningEffort };
  if (purpose === "synthesis") metrics.planId = planId;
  db.prepare(
    `INSERT OR IGNORE INTO sessions
     (id, purpose, related_id, agent_adapter, model, started_at, finished_at, state,
      pid, cwd, command_line, exit_code, error, metrics)
     VALUES (?, ?, ?, ?, ?, ?, NULL, 'running', NULL, NULL, ?, NULL, NULL, ?)`,
  ).run(
    liveCritiqueSessionId(meta.critiqueId, slot),
    purpose,
    meta.critiqueId,
    agent.agent,
    agent.model,
    meta.startedAt,
    meta.tmuxSession,
    JSON.stringify(metrics),
  );
}

function updateCritiqueSession(
  db: Database,
  sessionId: string,
  agent: CritiqueMeta["criticA"],
  finishedAt: string | null,
  sidecar?: SidecarMetricsPatch,
): void {
  const state = mapCritiqueAgentState(agent.status);
  const done = agent.status === "done" || agent.status === "failed";
  // Merge into the existing metrics blob so we preserve fields the
  // current call doesn't touch (planId stashed by synthesis writers;
  // tokens captured by a prior sync if a later one runs without a
  // sidecar handy).
  const existing = db.prepare("SELECT metrics FROM sessions WHERE id = ?").get(sessionId) as
    | { metrics: string | null }
    | undefined;
  const base = parseMetrics(existing?.metrics);
  const patch: Partial<SessionMetrics> = {
    durationMs: agent.durationMs,
    reasoningEffort: normalizeReasoning(agent.reasoningEffort),
  };
  if (sidecar) {
    patch.tokensIn = sidecar.tokensIn;
    patch.tokensOut = sidecar.tokensOut;
    patch.cacheRead = sidecar.cacheRead;
    patch.cacheCreate = sidecar.cacheCreate;
    patch.costUsd = sidecar.costUsd;
    patch.costSource = sidecar.costSource;
  }
  const merged = mergeMetrics(base, patch);
  db.prepare("UPDATE sessions SET state = ?, finished_at = ?, metrics = ? WHERE id = ?").run(
    state,
    done ? finishedAt : null,
    JSON.stringify(merged),
    sessionId,
  );
}

function normalizeReasoning(effort: string | undefined): "low" | "medium" | "high" | null {
  if (effort === "low" || effort === "medium" || effort === "high") return effort;
  return null;
}

function insertLiveCriticRun(
  db: Database,
  meta: CritiqueMeta,
  slot: "a" | "b",
  targetVersionId: string,
  agent: CritiqueMeta["criticA"],
): void {
  db.prepare(
    `INSERT OR IGNORE INTO critic_runs
     (id, critic_config_id, target_kind, target_id, session_id, findings, severity_summary,
      started_at, finished_at, state)
     VALUES (?, ?, 'plan_version', ?, ?, NULL, NULL, ?, NULL, 'running')`,
  ).run(
    liveCriticRunId(meta.critiqueId, slot),
    liveCriticConfigId(agent.agent, agent.model),
    targetVersionId,
    liveCritiqueSessionId(meta.critiqueId, slot === "a" ? "critic-a" : "critic-b"),
    meta.startedAt,
  );
}

/**
 * Soft-archive a plan: stage='archived' + archived_at populated. No-op if
 * the plans row hasn't been created yet (legacy task that never saw a
 * dual-write); the JSON index is still the source of truth for status.
 */
export function recordPlanArchived(db: Database, planId: string, archivedAt: string): void {
  db.prepare("UPDATE plans SET stage = 'archived', archived_at = ?, updated_at = ? WHERE id = ?").run(
    archivedAt,
    archivedAt,
    planId,
  );
}

/**
 * Reverse of `recordPlanArchived`. `status` is the plan's post-unarchive
 * status (always "draft" today) — we map it back to the SQLite stage and
 * clear archived_at.
 */
export function recordPlanUnarchived(db: Database, planId: string, status: Plan["status"], updatedAt: string): void {
  db.prepare("UPDATE plans SET stage = ?, archived_at = NULL, updated_at = ? WHERE id = ?").run(
    planStageForStatus(status),
    updatedAt,
    planId,
  );
}

/**
 * Mark the most recent jobs row for a plan as finished, with the
 * RunMeta's status mapped to a jobs.state. Called by serve.ts when it
 * reads RunMeta and notices a status transition that the bash runner
 * wrote to meta.json but the DB hasn't seen yet.
 */
export function syncJobState(db: Database, task: Plan, meta: Partial<RunMeta>): void {
  const taskRow = db.prepare("SELECT id FROM tasks WHERE plan_id = ? AND sequence = 1").get(task.id) as
    | { id: string }
    | undefined;
  if (!taskRow) return;

  const latest = db
    .prepare("SELECT id, run_number, state FROM jobs WHERE task_id = ? ORDER BY run_number DESC LIMIT 1")
    .get(taskRow.id) as { id: string; run_number: number; state: string } | undefined;
  if (!latest) return;

  const newState = mapMetaStatusToJobState(meta.status);
  const finishedAt =
    newState === "succeeded" || newState === "failed" ? (meta.endedAt ?? new Date().toISOString()) : null;
  if (newState === latest.state && !finishedAt) return;

  db.prepare(
    "UPDATE jobs SET state = ?, finished_at = COALESCE(?, finished_at), summary = COALESCE(?, summary) WHERE id = ?",
  ).run(newState, finishedAt, meta.errorMessage ?? null, latest.id);

  if (newState === "succeeded" || newState === "failed") {
    const planStage = newState === "succeeded" ? "completed" : "completed";
    db.prepare("UPDATE plans SET stage = ?, updated_at = ? WHERE id = ?").run(planStage, finishedAt, task.id);
    db.prepare("UPDATE tasks SET state = ?, completed_at = ?, updated_at = ? WHERE id = ?").run(
      newState === "succeeded" ? "completed" : "failed",
      finishedAt,
      finishedAt,
      taskRow.id,
    );
  }
}

function mapMetaStatusToJobState(status: string | undefined): string {
  switch (status) {
    case "done":
      return "succeeded";
    case "failed":
    case "quality_failed":
      return "failed";
    case "running":
    case "quality_check":
    case "creating_pr":
    case "fixing":
    case "reviewing":
      return "running";
    default:
      return "running";
  }
}

function ensurePlanAndSyntheticTask(db: Database, task: Plan): void {
  const planRow = db.prepare("SELECT id FROM plans WHERE id = ?").get(task.id);
  if (!planRow) {
    db.prepare(
      `INSERT INTO plans
       (id, title, repo_path, repo_branch, stage, intent, current_version_id, created_at, updated_at, metadata)
       VALUES (?, ?, ?, ?, ?, NULL, NULL, ?, ?, ?)`,
    ).run(
      task.id,
      task.title,
      task.repoRoot,
      task.branch,
      planStageForStatus(task.status),
      task.createdAt,
      task.createdAt,
      planMetadata(task),
    );
  }

  const taskRow = db.prepare("SELECT id FROM tasks WHERE plan_id = ? AND sequence = 1").get(task.id);
  if (taskRow) return;

  // Synthetic tasks row requires a plan_version_id (NOT NULL). If no v1 exists
  // yet, mint a placeholder one — the real next version will overwrite the
  // synthetic task's plan_version_id pointer.
  let firstVersionId: string;
  const existingV1 = db.prepare("SELECT id FROM plan_versions WHERE plan_id = ? AND version_number = 1").get(task.id) as
    | { id: string }
    | undefined;
  if (existingV1) {
    firstVersionId = existingV1.id;
  } else {
    firstVersionId = livePlanVersionId(task.id, 1);
    db.prepare(
      `INSERT INTO plan_versions
       (id, plan_id, version_number, document, sections, open_questions, created_by, created_at, notes)
       VALUES (?, ?, 1, '', '{}', NULL, 'backfill', ?, NULL)`,
    ).run(firstVersionId, task.id, task.createdAt);
    // Point the plan at the placeholder we just minted. Without this,
    // recordCritiqueStarted's `if (!targetVersionId) return` short-circuits
    // and the first critique on a self-healed legacy plan never lands its
    // sessions/critic_runs in SQLite. The `IS NULL` guard avoids clobbering
    // a pointer set by a concurrent writer (backfill, saveSpec).
    db.prepare("UPDATE plans SET current_version_id = ? WHERE id = ? AND current_version_id IS NULL").run(
      firstVersionId,
      task.id,
    );
  }

  db.prepare(
    `INSERT INTO tasks
     (id, plan_id, plan_version_id, sequence, title, spec, plan_section_refs, estimated_diff_size,
      dependencies, state, agent_preference, created_at, updated_at, started_at, completed_at)
     VALUES (?, ?, ?, 1, ?, '', NULL, NULL, NULL, ?, ?, ?, ?, NULL, NULL)`,
  ).run(
    liveTaskId(task.id),
    task.id,
    firstVersionId,
    task.title,
    taskStateForStatus(task.status),
    task.agent,
    task.createdAt,
    task.createdAt,
  );
}
