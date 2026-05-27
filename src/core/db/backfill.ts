/**
 * One-time backfill from `~/.forge/` JSON state into the SQLite contract.
 *
 * Reads every Plan, spec markdown, critique-meta.json, and run
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
import * as fs from "node:fs";
import * as path from "node:path";
import type { CritiqueAgentMeta, CritiqueMeta, ForgeStore, Plan, RunMeta } from "../store.ts";

/**
 * Legacy ~/.forge/index.json shape. Phase 3.5 renamed the in-memory map key
 * from `tasks` to `plans`, but on-disk JSON files written before the rename
 * still use `tasks`. Backfill is the migration bridge so it must accept both.
 */
interface LegacyIndex {
  version: 1;
  tasks?: Record<string, Plan>;
  plans?: Record<string, Plan>;
}

function readPlansFromIndex(store: ForgeStore): Plan[] {
  const indexFile = path.join(store.forgeDir, "index.json");
  if (!fs.existsSync(indexFile)) return [];
  try {
    const raw = JSON.parse(fs.readFileSync(indexFile, "utf-8")) as LegacyIndex;
    const map = raw.plans ?? raw.tasks ?? {};
    return Object.values(map);
  } catch {
    return [];
  }
}

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

function mapPlanStage(status: Plan["status"]): string {
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

function mapTaskState(status: Plan["status"]): string {
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

function planVersionId(planId: string, version: number): string {
  return `bf-pv-${planId}-v${version}`;
}

function syntheticTaskId(planId: string): string {
  return `bf-t-${planId}`;
}

function jobId(planId: string): string {
  return `bf-j-${planId}-r1`;
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
  const plans = readPlansFromIndex(store);
  const before = snapshotCounts(db);

  const tx = db.transaction(() => {
    for (const plan of plans) {
      insertPlan(db, plan);
      const pv = insertPlanVersion(db, plan, store);
      insertSyntheticTask(db, plan, pv.id);
      // current_version_id depends on plan_versions existing first
      db.prepare("UPDATE plans SET current_version_id = ? WHERE id = ?").run(pv.id, plan.id);
      insertJobFromRunMeta(db, plan, store);

      for (const critiqueId of store.listCritiques(plan.id)) {
        const meta = store.readCritiqueMeta(plan.id, critiqueId);
        if (!meta) continue;
        insertCritiqueRecords(db, plan, pv.id, meta);
      }
    }
  });
  tx();

  return diffCounts(before, snapshotCounts(db));
}

// ── per-record inserts ──────────────────────────────────────────────────────

function insertPlan(db: Database, plan: Plan): void {
  const metadata = {
    repoName: plan.repoName,
    worktree: plan.worktree,
    agent: plan.agent,
    model: plan.model,
    prUrl: plan.prUrl,
    prNumber: plan.prNumber,
    jiraTicket: plan.jiraTicket,
    tmuxSession: plan.tmuxSession,
    logFile: plan.logFile,
    lastImproveError: plan.lastImproveError,
    originalStatus: plan.status,
  };
  const updatedAt = plan.archivedAt ?? plan.completedAt ?? plan.launchedAt ?? plan.createdAt;
  db.prepare(
    `INSERT OR IGNORE INTO plans
     (id, title, repo_path, repo_branch, stage, intent, current_version_id, created_at, updated_at, archived_at, metadata)
     VALUES (?, ?, ?, ?, ?, NULL, NULL, ?, ?, ?, ?)`,
  ).run(
    plan.id,
    plan.title,
    plan.repoRoot,
    plan.branch,
    mapPlanStage(plan.status),
    plan.createdAt,
    updatedAt,
    plan.archivedAt,
    JSON.stringify(metadata),
  );
}

function insertPlanVersion(db: Database, plan: Plan, store: ForgeStore): { id: string } {
  const version = Math.max(1, plan.specVersion ?? 1);
  const desiredId = planVersionId(plan.id, version);
  const document = store.getSpec(plan.id) ?? "";
  db.prepare(
    `INSERT OR IGNORE INTO plan_versions
     (id, plan_id, version_number, document, sections, open_questions, created_by, created_at, notes)
     VALUES (?, ?, ?, ?, '{}', NULL, 'backfill', ?, NULL)`,
  ).run(desiredId, plan.id, version, document, plan.createdAt);
  // UNIQUE(plan_id, version_number) can block the insert when a live writer
  // already wrote a `pv-{plan}-v{n}` row; INSERT OR IGNORE silently no-ops
  // and the bf- id is never persisted. Resolve to whatever id actually
  // owns this (plan_id, version_number) pair so the downstream FK holds.
  // ensurePlanAndSyntheticTask may also have minted an empty placeholder v1
  // ahead of us — if we have the real document on disk, backfill that in.
  const existing = db
    .prepare("SELECT id, document FROM plan_versions WHERE plan_id = ? AND version_number = ?")
    .get(plan.id, version) as { id: string; document: string } | undefined;
  if (existing && existing.document === "" && document !== "") {
    db.prepare("UPDATE plan_versions SET document = ? WHERE id = ?").run(document, existing.id);
  }
  return { id: existing?.id ?? desiredId };
}

function insertSyntheticTask(db: Database, plan: Plan, planVersionId: string): void {
  const updatedAt = plan.completedAt ?? plan.launchedAt ?? plan.createdAt;
  // Same hazard as plan_versions: the live writer's `t-{plan}` row may
  // already own (plan_id, sequence=1). Skip the insert in that case — the
  // synthetic row exists, just under a different id, and downstream queries
  // resolve it by (plan_id, sequence) not by id.
  const existing = db.prepare("SELECT id FROM tasks WHERE plan_id = ? AND sequence = 1").get(plan.id);
  if (existing) return;
  db.prepare(
    `INSERT OR IGNORE INTO tasks
     (id, plan_id, plan_version_id, sequence, title, spec, plan_section_refs, estimated_diff_size,
      dependencies, state, agent_preference, created_at, updated_at, started_at, completed_at)
     VALUES (?, ?, ?, 1, ?, '', NULL, NULL, NULL, ?, ?, ?, ?, ?, ?)`,
  ).run(
    syntheticTaskId(plan.id),
    plan.id,
    planVersionId,
    plan.title,
    mapTaskState(plan.status),
    plan.agent,
    plan.createdAt,
    updatedAt,
    plan.launchedAt,
    plan.completedAt,
  );
}

function insertJobFromRunMeta(db: Database, plan: Plan, store: ForgeStore): void {
  const metaRaw = store.readRunMeta(plan.id);
  if (!metaRaw) return;
  const meta = metaRaw as Partial<RunMeta>;
  // Resolve the actual synthetic-task id (live `t-*` or backfill `bf-t-*`)
  // by the (plan_id, sequence=1) lookup so the FK holds regardless of
  // which writer got there first.
  const taskRow = db.prepare("SELECT id FROM tasks WHERE plan_id = ? AND sequence = 1").get(plan.id) as
    | { id: string }
    | undefined;
  if (!taskRow) return;
  db.prepare(
    `INSERT OR IGNORE INTO jobs
     (id, task_id, run_number, run_kind, session_id, worktree_path, branch_name, state,
      blocker_summary, eta_seconds, started_at, finished_at, exit_code, summary)
     VALUES (?, ?, 1, 'initial', NULL, ?, ?, ?, ?, NULL, ?, ?, NULL, ?)`,
  ).run(
    jobId(plan.id),
    taskRow.id,
    meta.worktree ?? plan.worktree,
    plan.branch,
    mapJobState(meta.status),
    meta.errorMessage ?? null,
    meta.startedAt ?? plan.launchedAt,
    meta.endedAt ?? plan.completedAt,
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

function insertCritiqueRecords(db: Database, task: Plan, planVersionId: string, meta: CritiqueMeta): void {
  insertCriticConfig(db, meta.criticA.agent, meta.criticA.model, meta.startedAt);
  insertCriticConfig(db, meta.criticB.agent, meta.criticB.model, meta.startedAt);
  insertCriticConfig(db, meta.synthesizer.agent, meta.synthesizer.model, meta.startedAt);

  const sessionForA = critiqueSessionId(meta.critiqueId, "critic-a");
  const sessionForB = critiqueSessionId(meta.critiqueId, "critic-b");
  const sessionForSynth = critiqueSessionId(meta.critiqueId, "synth");

  insertCritiqueSession(db, sessionForA, "critique", meta.critiqueId, meta.criticA, meta, task.id);
  insertCritiqueSession(db, sessionForB, "critique", meta.critiqueId, meta.criticB, meta, task.id);
  insertCritiqueSession(db, sessionForSynth, "synthesis", meta.critiqueId, meta.synthesizer, meta, task.id);

  insertCriticRun(db, criticRunId(meta.critiqueId, "a"), meta.criticA, sessionForA, planVersionId, meta);
  insertCriticRun(db, criticRunId(meta.critiqueId, "b"), meta.criticB, sessionForB, planVersionId, meta);

  // Only "done" critiques produced a real synthesis. Inserting a synthesis
  // row for a failed critique would render in history as the misleading
  // literal "ready" (see history.ts:formatSynthesis on NULL recommendation).
  if (meta.status === "done") {
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
  planId: string,
): void {
  const finishedAt = agent.status === "done" || agent.status === "failed" ? meta.completedAt : null;
  // Synthesis sessions can't be resolved to a plan via critic_runs, so
  // stash planId in metrics so the Activity view's directPlanId path works.
  const metrics: Record<string, unknown> = {
    durationMs: agent.durationMs,
    reasoningEffort: agent.reasoningEffort,
  };
  if (purpose === "synthesis") metrics.planId = planId;
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
    JSON.stringify(metrics),
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
