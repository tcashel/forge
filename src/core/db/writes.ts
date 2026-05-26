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
import type { TaskRecord } from "../store.ts";

export function livePlanVersionId(taskId: string, version: number): string {
  return `pv-${taskId}-v${version}`;
}

export function liveTaskId(taskId: string): string {
  return `t-${taskId}`;
}

export function liveJobId(taskId: string, runNumber: number): string {
  return `j-${taskId}-r${runNumber}`;
}

function planStageForStatus(status: TaskRecord["status"]): string {
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
    default:
      return "drafting";
  }
}

function taskStateForStatus(status: TaskRecord["status"]): string {
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

function planMetadata(task: TaskRecord): string {
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
export function recordPlanCreated(db: Database, task: TaskRecord, body: string): void {
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
 * predates dual-write, or test constructed it via upsertTask without
 * saveSpec), they're created lazily from the TaskRecord. The synthetic
 * task is matched by `(plan_id, sequence=1)` so backfilled IDs (`bf-t-*`)
 * and live IDs (`t-*`) both work.
 */
export function recordPlanVersionAdded(db: Database, task: TaskRecord, version: number, body: string): void {
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

function ensurePlanAndSyntheticTask(db: Database, task: TaskRecord): void {
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
