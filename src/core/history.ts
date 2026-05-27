/**
 * Unified plan timeline — Phase 4 of COO-84.
 *
 * Collapses every observable signal for a plan (spec versions, critique
 * attempts, syntheses, launches) into one chronological event stream.
 * Backs `forge history <plan-id>`, `GET /api/plans/:id/history`, and the
 * Workbench HistoryTab.
 *
 * Pure DB read — no mutations, no JSON fallback. Phase 5 will drop
 * `~/.forge/runs/{id}/meta.json` once these surfaces are the only readers.
 */

import type { Database } from "bun:sqlite";

export type PlanHistoryEventKind =
  | "spec_saved"
  | "critique_started"
  | "critique_synthesized"
  | "launch_started"
  | "launch_completed";

export interface PlanHistoryEvent {
  /** ISO-8601 timestamp the event occurred at; ordering key. */
  ts: string;
  kind: PlanHistoryEventKind;
  /** Primary key of the row this event represents — drill-in target. */
  ref: string;
  /** One-line human description suitable for terminal + sidebar rendering. */
  summary: string;
}

interface PlanVersionRow {
  id: string;
  version_number: number;
  created_at: string;
  created_by: string;
}

interface JobRow {
  id: string;
  run_number: number;
  state: string;
  started_at: string | null;
  finished_at: string | null;
  summary: string | null;
  blocker_summary: string | null;
}

interface CritiqueStartRow {
  critique_id: string;
  started_at: string;
  /** Comma-separated `agent:model` for the critic pair, derived from critic_configs. */
  agents: string;
}

interface SynthesisRow {
  id: string;
  created_at: string;
  recommendation: string | null;
}

export function buildPlanHistory(db: Database, planId: string): PlanHistoryEvent[] {
  const events: PlanHistoryEvent[] = [];

  for (const v of selectPlanVersions(db, planId)) {
    events.push({
      ts: v.created_at,
      kind: "spec_saved",
      ref: v.id,
      summary: formatSpecSaved(v),
    });
  }

  for (const j of selectJobs(db, planId)) {
    if (j.started_at) {
      events.push({
        ts: j.started_at,
        kind: "launch_started",
        ref: j.id,
        summary: `r${j.run_number} started`,
      });
    }
    if (j.finished_at) {
      events.push({
        ts: j.finished_at,
        kind: "launch_completed",
        ref: j.id,
        summary: formatLaunchCompleted(j),
      });
    }
  }

  for (const c of selectCritiqueStarts(db, planId)) {
    events.push({
      ts: c.started_at,
      kind: "critique_started",
      ref: c.critique_id,
      summary: `${c.critique_id} — ${c.agents}`,
    });
  }

  for (const s of selectSyntheses(db, planId)) {
    events.push({
      ts: s.created_at,
      kind: "critique_synthesized",
      ref: s.id,
      summary: formatSynthesis(s),
    });
  }

  // Newest first — operators care about the latest activity.
  return events.sort((a, b) => b.ts.localeCompare(a.ts));
}

function selectPlanVersions(db: Database, planId: string): PlanVersionRow[] {
  return db
    .prepare(
      `SELECT id, version_number, created_at, created_by
       FROM plan_versions
       WHERE plan_id = ?`,
    )
    .all(planId) as PlanVersionRow[];
}

function selectJobs(db: Database, planId: string): JobRow[] {
  return db
    .prepare(
      `SELECT j.id, j.run_number, j.state, j.started_at, j.finished_at, j.summary, j.blocker_summary
       FROM jobs j JOIN tasks t ON j.task_id = t.id
       WHERE t.plan_id = ?`,
    )
    .all(planId) as JobRow[];
}

function selectCritiqueStarts(db: Database, planId: string): CritiqueStartRow[] {
  // One row per critique attempt: minimum critic-run start, plus the
  // critic pair's "agent:model" labels concatenated. Sessions.related_id
  // is the critique_id by convention (see writes.ts + backfill.ts).
  return db
    .prepare(
      `SELECT s.related_id AS critique_id,
              MIN(cr.started_at) AS started_at,
              GROUP_CONCAT(cc.agent_adapter || ':' || cc.model, ', ') AS agents
       FROM critic_runs cr
       JOIN sessions s ON cr.session_id = s.id
       JOIN critic_configs cc ON cr.critic_config_id = cc.id
       JOIN plan_versions pv
              ON pv.id = cr.target_id AND cr.target_kind = 'plan_version'
       WHERE pv.plan_id = ? AND s.purpose = 'critique'
       GROUP BY s.related_id`,
    )
    .all(planId) as CritiqueStartRow[];
}

function selectSyntheses(db: Database, planId: string): SynthesisRow[] {
  return db
    .prepare(
      `SELECT cs.id, cs.created_at, cs.recommendation
       FROM critic_syntheses cs
       JOIN plan_versions pv
              ON pv.id = cs.target_id AND cs.target_kind = 'plan_version'
       WHERE pv.plan_id = ?`,
    )
    .all(planId) as SynthesisRow[];
}

// ── formatters ─────────────────────────────────────────────────────────────

function formatSpecSaved(v: PlanVersionRow): string {
  // Live writer stamps "agent:improver"; older rows / a planned future
  // surface for other agents may use the "agent:" prefix more broadly.
  if (v.created_by === "agent:improver" || v.created_by === "improver") {
    return `v${v.version_number} (auto-improved)`;
  }
  if (v.created_by === "backfill") return `v${v.version_number} (backfilled from JSON)`;
  return `v${v.version_number} saved`;
}

function formatLaunchCompleted(j: JobRow): string {
  const tail = j.summary ?? j.blocker_summary;
  const tailFmt = tail ? ` — ${truncate(tail, 60)}` : "";
  return `r${j.run_number} ${j.state}${tailFmt}`;
}

function formatSynthesis(s: SynthesisRow): string {
  if (!s.recommendation) return "ready";
  return truncate(s.recommendation, 80);
}

function truncate(s: string, max: number): string {
  const trimmed = s.replace(/\s+/g, " ").trim();
  return trimmed.length <= max ? trimmed : `${trimmed.slice(0, max - 1)}…`;
}
