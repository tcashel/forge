/**
 * One-time backfill from `~/.forge/` JSON state into the SQLite contract.
 *
 * Reads every TaskRecord, spec markdown, critique-meta.json, and run
 * meta.json, then emits the corresponding `plans`, `plan_versions`,
 * `tasks` (synthetic 1:1 row per plan), `critic_configs`, `sessions`,
 * `critic_runs`, `critic_syntheses`, and `jobs` rows.
 *
 * Idempotent: every insert uses a stable backfill-prefixed UUID and
 * INSERT OR IGNORE so re-running is a no-op. The original JSON files
 * are never modified — Phase 5 owns the cleanup.
 *
 * Information loss is honest:
 * - prior overwritten runs are unrecoverable (only the latest meta.json
 *   survives in ~/.forge/runs/{id}/), so each plan gets exactly one
 *   backfilled `jobs` row;
 * - critic prompt templates aren't on disk, so `critic_configs` rows
 *   carry placeholder text;
 * - section structure of specs isn't parsed, so `plan_versions.sections`
 *   is "{}".
 */

import type { Database } from "bun:sqlite";
import type { CritiqueAgentMeta, CritiqueMeta, ForgeStore, RunMeta, TaskRecord } from "../store.ts";

export interface BackfillCounts {
  plans: number;
  planVersions: number;
  tasks: number;
  criticConfigs: number;
  sessions: number;
  criticRuns: number;
  criticSyntheses: number;
  jobs: number;
}

const ZERO_COUNTS: BackfillCounts = {
  plans: 0,
  planVersions: 0,
  tasks: 0,
  criticConfigs: 0,
  sessions: 0,
  criticRuns: 0,
  criticSyntheses: 0,
  jobs: 0,
};

// ── status / stage mappings (see docs/SCHEMA.md enums) ──────────────────────

function mapPlanStage(status: TaskRecord["status"]): string {
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

function mapTaskState(status: TaskRecord["status"]): string {
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

function mapJobState(metaStatus: string | undefined): string {
  switch (metaStatus) {
    case "running":
    case "quality_check":
    case "creating_pr":
    case "fixing":
    case "reviewing":
      return "running";
    case "done":
      return "succeeded";
    case "failed":
    case "quality_failed":
      return "failed";
    default:
      return "pending";
  }
}

function mapCritiqueSessionState(s: CritiqueAgentMeta["status"]): string {
  switch (s) {
    case "done":
      return "completed";
    case "failed":
      return "failed";
    case "pending":
      return "running";
    default:
      return "running";
  }
}

function mapCritiqueRunState(s: CritiqueAgentMeta["status"]): string {
  switch (s) {
    case "done":
      return "completed";
    case "failed":
      return "failed";
    case "pending":
      return "running";
    default:
      return "running";
  }
}

// ── stable ids ──────────────────────────────────────────────────────────────

function safe(s: string): string {
  return s.replace(/[^a-z0-9_-]/gi, "_");
}

function planVersionId(taskId: string, version: number): string {
  return `bf-pv-${taskId}-v${version}`;
}

function syntheticTaskId(taskId: string): string {
  return `bf-t-${taskId}`;
}

function jobId(taskId: string): string {
  return `bf-j-${taskId}-r1`;
}

function criticConfigId(agent: string, model: string): string {
  return `bf-cc-${safe(agent)}-${safe(model)}`;
}

function critiqueSessionId(critiqueId: string, slot: "critic-a" | "critic-b" | "synth"): string {
  return `bf-s-${critiqueId}-${slot}`;
}

function criticRunId(critiqueId: string, slot: "a" | "b"): string {
  return `bf-cr-${critiqueId}-${slot}`;
}

function critiqueSynthesisId(critiqueId: string): string {
  return `bf-cs-${critiqueId}`;
}

// ── main entry ──────────────────────────────────────────────────────────────

const COUNTED_TABLES: Record<keyof BackfillCounts, string> = {
  plans: "plans",
  planVersions: "plan_versions",
  tasks: "tasks",
  criticConfigs: "critic_configs",
  sessions: "sessions",
  criticRuns: "critic_runs",
  criticSyntheses: "critic_syntheses",
  jobs: "jobs",
};

function snapshotCounts(db: Database): BackfillCounts {
  const out: BackfillCounts = { ...ZERO_COUNTS };
  for (const [key, table] of Object.entries(COUNTED_TABLES) as [keyof BackfillCounts, string][]) {
    const row = db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number };
    out[key] = row.n;
  }
  return out;
}

function diffCounts(before: BackfillCounts, after: BackfillCounts): BackfillCounts {
  const out: BackfillCounts = { ...ZERO_COUNTS };
  for (const key of Object.keys(COUNTED_TABLES) as (keyof BackfillCounts)[]) {
    out[key] = after[key] - before[key];
  }
  return out;
}

export function backfillFromJson(store: ForgeStore, db: Database): BackfillCounts {
  const index = store.readIndex();
  const before = snapshotCounts(db);

  const tx = db.transaction(() => {
    for (const task of Object.values(index.tasks)) {
      insertPlan(db, task);
      const pv = insertPlanVersion(db, task, store);
      insertSyntheticTask(db, task, pv.id);
      // current_version_id depends on plan_versions existing first
      db.prepare("UPDATE plans SET current_version_id = ? WHERE id = ?").run(pv.id, task.id);
      insertJobFromRunMeta(db, task, store);

      for (const critiqueId of store.listCritiques(task.id)) {
        const meta = store.readCritiqueMeta(task.id, critiqueId);
        if (!meta) continue;
        insertCritiqueRecords(db, task, pv.id, meta);
      }
    }
  });
  tx();

  return diffCounts(before, snapshotCounts(db));
}

// ── per-record inserts ──────────────────────────────────────────────────────

function insertPlan(db: Database, task: TaskRecord): void {
  const metadata = {
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
  };
  const updatedAt = task.completedAt ?? task.launchedAt ?? task.createdAt;
  db.prepare(
    `INSERT OR IGNORE INTO plans
     (id, title, repo_path, repo_branch, stage, intent, current_version_id, created_at, updated_at, metadata)
     VALUES (?, ?, ?, ?, ?, NULL, NULL, ?, ?, ?)`,
  ).run(
    task.id,
    task.title,
    task.repoRoot,
    task.branch,
    mapPlanStage(task.status),
    task.createdAt,
    updatedAt,
    JSON.stringify(metadata),
  );
}

function insertPlanVersion(db: Database, task: TaskRecord, store: ForgeStore): { id: string } {
  const version = Math.max(1, task.specVersion ?? 1);
  const id = planVersionId(task.id, version);
  const document = store.getSpec(task.id) ?? "";
  db.prepare(
    `INSERT OR IGNORE INTO plan_versions
     (id, plan_id, version_number, document, sections, open_questions, created_by, created_at, notes)
     VALUES (?, ?, ?, ?, '{}', NULL, 'backfill', ?, NULL)`,
  ).run(id, task.id, version, document, task.createdAt);
  return { id };
}

function insertSyntheticTask(db: Database, task: TaskRecord, planVersionId: string): void {
  const updatedAt = task.completedAt ?? task.launchedAt ?? task.createdAt;
  db.prepare(
    `INSERT OR IGNORE INTO tasks
     (id, plan_id, plan_version_id, sequence, title, spec, plan_section_refs, estimated_diff_size,
      dependencies, state, agent_preference, created_at, updated_at, started_at, completed_at)
     VALUES (?, ?, ?, 1, ?, '', NULL, NULL, NULL, ?, ?, ?, ?, ?, ?)`,
  ).run(
    syntheticTaskId(task.id),
    task.id,
    planVersionId,
    task.title,
    mapTaskState(task.status),
    task.agent,
    task.createdAt,
    updatedAt,
    task.launchedAt,
    task.completedAt,
  );
}

function insertJobFromRunMeta(db: Database, task: TaskRecord, store: ForgeStore): void {
  const metaRaw = store.readRunMeta(task.id);
  if (!metaRaw) return;
  const meta = metaRaw as Partial<RunMeta>;
  db.prepare(
    `INSERT OR IGNORE INTO jobs
     (id, task_id, run_number, run_kind, session_id, worktree_path, branch_name, state,
      blocker_summary, eta_seconds, started_at, finished_at, exit_code, summary)
     VALUES (?, ?, 1, 'initial', NULL, ?, ?, ?, ?, NULL, ?, ?, NULL, ?)`,
  ).run(
    jobId(task.id),
    syntheticTaskId(task.id),
    meta.worktree ?? task.worktree,
    task.branch,
    mapJobState(meta.status),
    meta.errorMessage ?? null,
    meta.startedAt ?? task.launchedAt,
    meta.endedAt ?? task.completedAt,
    meta.errorMessage ?? null,
  );
}

function insertCriticConfig(db: Database, agent: string, model: string, createdAt: string): void {
  db.prepare(
    `INSERT OR IGNORE INTO critic_configs
     (id, name, description, prompt_template, agent_adapter, model, role, enabled, created_at, updated_at)
     VALUES (?, ?, '(backfilled — original prompt not on disk)', '(backfilled)', ?, ?, 'plan', 1, ?, ?)`,
  ).run(criticConfigId(agent, model), `${agent}:${model}`, agent, model, createdAt, createdAt);
}

function insertCritiqueRecords(db: Database, _task: TaskRecord, planVersionId: string, meta: CritiqueMeta): void {
  insertCriticConfig(db, meta.criticA.agent, meta.criticA.model, meta.startedAt);
  insertCriticConfig(db, meta.criticB.agent, meta.criticB.model, meta.startedAt);
  insertCriticConfig(db, meta.synthesizer.agent, meta.synthesizer.model, meta.startedAt);

  const sessionForA = critiqueSessionId(meta.critiqueId, "critic-a");
  const sessionForB = critiqueSessionId(meta.critiqueId, "critic-b");
  const sessionForSynth = critiqueSessionId(meta.critiqueId, "synth");

  insertCritiqueSession(db, sessionForA, "critique", meta.critiqueId, meta.criticA, meta);
  insertCritiqueSession(db, sessionForB, "critique", meta.critiqueId, meta.criticB, meta);
  insertCritiqueSession(db, sessionForSynth, "synthesis", meta.critiqueId, meta.synthesizer, meta);

  insertCriticRun(db, criticRunId(meta.critiqueId, "a"), meta.criticA, sessionForA, planVersionId, meta);
  insertCriticRun(db, criticRunId(meta.critiqueId, "b"), meta.criticB, sessionForB, planVersionId, meta);

  if (meta.status === "done" || meta.status === "failed") {
    db.prepare(
      `INSERT OR IGNORE INTO critic_syntheses
       (id, target_kind, target_id, critic_run_ids, agreements, disagreements, recommendation, created_at)
       VALUES (?, 'plan_version', ?, ?, NULL, NULL, NULL, ?)`,
    ).run(
      critiqueSynthesisId(meta.critiqueId),
      planVersionId,
      JSON.stringify([criticRunId(meta.critiqueId, "a"), criticRunId(meta.critiqueId, "b")]),
      meta.completedAt ?? meta.startedAt,
    );
  }
}

function insertCritiqueSession(
  db: Database,
  id: string,
  purpose: "critique" | "synthesis",
  relatedId: string,
  agent: CritiqueAgentMeta,
  meta: CritiqueMeta,
): void {
  const finishedAt = agent.status === "done" || agent.status === "failed" ? meta.completedAt : null;
  db.prepare(
    `INSERT OR IGNORE INTO sessions
     (id, purpose, related_id, agent_adapter, model, started_at, finished_at, state,
      pid, cwd, command_line, exit_code, error, metrics)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, NULL, NULL, ?)`,
  ).run(
    id,
    purpose,
    relatedId,
    agent.agent,
    agent.model,
    meta.startedAt,
    finishedAt,
    mapCritiqueSessionState(agent.status),
    meta.tmuxSession,
    JSON.stringify({ durationMs: agent.durationMs, reasoningEffort: agent.reasoningEffort }),
  );
}

function insertCriticRun(
  db: Database,
  id: string,
  agent: CritiqueAgentMeta,
  sessionId: string,
  planVersionId: string,
  meta: CritiqueMeta,
): void {
  const finishedAt = agent.status === "done" || agent.status === "failed" ? meta.completedAt : null;
  db.prepare(
    `INSERT OR IGNORE INTO critic_runs
     (id, critic_config_id, target_kind, target_id, session_id, findings, severity_summary,
      started_at, finished_at, state)
     VALUES (?, ?, 'plan_version', ?, ?, NULL, NULL, ?, ?, ?)`,
  ).run(
    id,
    criticConfigId(agent.agent, agent.model),
    planVersionId,
    sessionId,
    meta.startedAt,
    finishedAt,
    mapCritiqueRunState(agent.status),
  );
}
