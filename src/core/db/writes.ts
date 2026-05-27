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
import type { CritiqueMeta, Plan, RunMeta } from "../store.ts";

export function livePlanVersionId(planId: string, version: number): string {
  return `pv-${planId}-v${version}`;
}

export function liveTaskId(planId: string): string {
  return `t-${planId}`;
}

export function liveJobId(planId: string, runNumber: number): string {
  return `j-${planId}-r${runNumber}`;
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
       VALUES (?, ?, 1, ?, '{}', NULL, 'user', ?, NULL)`,
    ).run(planVersionId, task.id, body, task.createdAt);

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
export function recordPlanVersionAdded(db: Database, task: Plan, version: number, body: string): void {
  const planVersionId = livePlanVersionId(task.id, version);
  const now = new Date().toISOString();

  db.transaction(() => {
    ensurePlanAndSyntheticTask(db, task);

    db.prepare(
      `INSERT OR IGNORE INTO plan_versions
       (id, plan_id, version_number, document, sections, open_questions, created_by, created_at, notes)
       VALUES (?, ?, ?, ?, '{}', NULL, 'agent:improver', ?, NULL)`,
    ).run(planVersionId, task.id, version, body, now);

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

    db.prepare(
      `INSERT INTO jobs
       (id, task_id, run_number, run_kind, session_id, worktree_path, branch_name, state,
        blocker_summary, eta_seconds, started_at, finished_at, exit_code, summary)
       VALUES (?, ?, ?, 'initial', NULL, ?, ?, 'running', NULL, NULL, ?, NULL, NULL, NULL)`,
    ).run(liveJobId(task.id, runNumber), taskRowId, runNumber, meta.worktree, task.branch, meta.startedAt);

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
  return `s-${critiqueId}-${slot}`;
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

    insertCritiqueSession(db, meta, "critic-a", "critique", meta.criticA);
    insertCritiqueSession(db, meta, "critic-b", "critique", meta.criticB);
    insertCritiqueSession(db, meta, "synth", "synthesis", meta.synthesizer);

    insertLiveCriticRun(db, meta, "a", targetVersionId, meta.criticA);
    insertLiveCriticRun(db, meta, "b", targetVersionId, meta.criticB);
  })();
}

/**
 * Read-path sync — reconciles DB state with the bash runner's
 * critique-meta.json. Called by API/CLI readers before returning data
 * so finished critiques land their 'completed'/'failed' state and the
 * synthesis row appears. Idempotent.
 */
export function syncCritiqueState(db: Database, meta: CritiqueMeta): void {
  db.transaction(() => {
    const finishedAt = meta.completedAt ?? null;

    // Sync the three sessions
    updateCritiqueSession(db, liveCritiqueSessionId(meta.critiqueId, "critic-a"), meta.criticA, finishedAt);
    updateCritiqueSession(db, liveCritiqueSessionId(meta.critiqueId, "critic-b"), meta.criticB, finishedAt);
    updateCritiqueSession(db, liveCritiqueSessionId(meta.critiqueId, "synth"), meta.synthesizer, finishedAt);

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
): void {
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
    JSON.stringify({ reasoningEffort: agent.reasoningEffort }),
  );
}

function updateCritiqueSession(
  db: Database,
  sessionId: string,
  agent: CritiqueMeta["criticA"],
  finishedAt: string | null,
): void {
  const state = mapCritiqueAgentState(agent.status);
  const done = agent.status === "done" || agent.status === "failed";
  db.prepare("UPDATE sessions SET state = ?, finished_at = ?, metrics = ? WHERE id = ?").run(
    state,
    done ? finishedAt : null,
    JSON.stringify({ durationMs: agent.durationMs, reasoningEffort: agent.reasoningEffort }),
    sessionId,
  );
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
