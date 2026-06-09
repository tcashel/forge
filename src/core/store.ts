/**
 * Forge Store — global ~/.forge/ state management
 *
 * All specs and run metadata live at ~/.forge/ so they're accessible
 * from any repo. Each task references the repo it belongs to.
 */

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { atomicWriteJSON, atomicWriteText } from "./atomic-write.js";
import { ForgeDb } from "./db/connection.ts";
import { syncJobState } from "./db/writes.ts";
import { withFileLock } from "./file-lock.js";

export type PlanStatus =
  | "draft"
  | "running"
  | "quality_check"
  | "creating_pr"
  | "done"
  | "failed"
  | "quality_failed"
  | "fixing"
  | "archived";

export type LaunchTarget = "claude" | "codex" | "opencode" | "gemini";

export interface Plan {
  id: string;
  title: string;
  repoRoot: string;
  repoName: string;
  branch: string;
  worktree: string | null;
  status: PlanStatus;
  agent: LaunchTarget | null;
  model: string | null;
  createdAt: string;
  launchedAt: string | null;
  completedAt: string | null;
  prUrl: string | null;
  prNumber: number | null;
  tmuxSession: string | null;
  logFile: string | null;
  jiraTicket: string | null;
  specFile: string;
  specVersion: number;
  /**
   * Outcome of the most recent auto-improve attempt (forge spec save / spec improve).
   * Non-null only when the attempt errored or was skipped — successful applies clear it.
   * Surfaced in the Workbench so the user can retry or launch anyway.
   */
  lastImproveError: { mode: string; error: string; at: string } | null;
  /**
   * When the spec was soft-archived. Null while the spec is live; set on
   * `forge spec archive`; cleared on `forge spec unarchive`. Paired with
   * `status === "archived"`: status gates UI/CLI filters, archivedAt records when.
   */
  archivedAt: string | null;
}

export interface ForgeIndex {
  version: 1;
  plans: Record<string, Plan>;
}

/**
 * Per-repo configuration remembered between sessions. Keyed by absolute
 * repo root path. Currently used to remember the default JIRA project
 * and ticket type so we don't have to ask every save.
 */
export type ReasoningEffort = "low" | "medium" | "high" | "xhigh";

export type ReviewVerdict = "approve" | "request-changes" | "block";

export interface RunMeta {
  planId: string;
  tmuxSession: string;
  logFile: string;
  agent: LaunchTarget;
  model: string;
  worktree: string;
  status: PlanStatus | "reviewing";
  startedAt: string;
  prUrl: string | null;
  endedAt?: string;
  durationMs?: number;
  baseSha?: string;
  finalSha?: string;
  prNumber?: number;
  qualityResults?: { command: string; ok: boolean; durationMs: number }[];
  reasoningEffort?: ReasoningEffort;
  reviewerAgent?: LaunchTarget;
  reviewerModel?: string;
  reviewerReasoningEffort?: ReasoningEffort;
  reviewVerdict?: ReviewVerdict | null;
  reviewError?: string | null;
  /** Human-readable failure reason. Surfaced on the Workbench failure card. */
  errorMessage?: string;
}

export interface RepoConfig {
  jiraProject?: string;
  jiraType?: string;
  /** Default implementer agent for `forge launch` when no flag/task value is set. */
  defaultAgent?: LaunchTarget;
  /** Default implementer model for `forge launch` when no flag/task value is set. */
  defaultModel?: string;
  critiqueAgentA?: string;
  critiqueModelA?: string;
  critiqueReasoningA?: ReasoningEffort;
  critiqueAgentB?: string;
  critiqueModelB?: string;
  critiqueReasoningB?: ReasoningEffort;
  critiqueAgentSynth?: string;
  critiqueModelSynth?: string;
  critiqueReasoningSynth?: ReasoningEffort;
  reviewerAgent?: LaunchTarget;
  reviewerModel?: string;
  reviewerReasoningEffort?: ReasoningEffort;
  fixerAgent?: LaunchTarget;
  fixerModel?: string;
  fixerReasoningEffort?: ReasoningEffort;
  autoFix?: boolean;
  autoFixRounds?: number;
  // ── Auto-improve (forge spec save) ──────────────────────────────────────
  /** Run the auto-improve loop after `forge spec save`. Treated as `true` when undefined. */
  autoImprove?: boolean;
  improverAgent?: LaunchTarget;
  improverModel?: string;
  improverReasoning?: ReasoningEffort;
  // ── GitHub CLI overrides ────────────────────────────────────────────────
  /** gh account to use for this repo (e.g. "tcashelmgni"). Falls back to gh's active account. */
  ghUser?: string;
  /** gh hostname (e.g. "github.com" or an Enterprise host). Falls back to github.com. */
  ghHost?: string;
}

export interface RepoConfigFile {
  version: 1;
  repos: Record<string, RepoConfig>;
  workbench?: {
    registeredRepos?: Record<string, RegisteredWorkbenchRepo>;
  };
}

export interface RegisteredWorkbenchRepo {
  root: string;
  name: string;
  addedAt: string;
}

export interface CritiqueAgentMeta {
  agent: LaunchTarget;
  model: string;
  reasoningEffort?: ReasoningEffort;
  status: "pending" | "done" | "failed";
  durationMs: number | null;
}

export interface CritiqueMeta {
  schemaVersion: 1;
  planId: string;
  critiqueId: string;
  specTitle: string;
  repoRoot: string;
  repoName: string;
  status: "running_critics" | "running_synth" | "done" | "failed";
  startedAt: string;
  completedAt: string | null;
  viewedAt: string | null;
  tmuxSession: string;
  criticA: CritiqueAgentMeta;
  criticB: CritiqueAgentMeta;
  synthesizer: CritiqueAgentMeta;
}

export interface ForgeStoreOptions {
  /**
   * Override the forge state directory. Defaults to `~/.forge/`. Tests
   * pass an explicit path because `os.homedir()` is captured at process
   * startup — mutating `process.env.HOME` mid-run does not redirect it,
   * so HOME-tweaks aren't a viable isolation strategy.
   */
  forgeDir?: string;
}

export class ForgeStore {
  readonly forgeDir: string;
  readonly specsDir: string;
  readonly runsDir: string;
  readonly critiquesDir: string;
  readonly indexFile: string;

  readonly repoConfigFile: string;

  #db: ForgeDb | null = null;

  constructor(opts: ForgeStoreOptions = {}) {
    this.forgeDir = opts.forgeDir ?? path.join(os.homedir(), ".forge");
    this.specsDir = path.join(this.forgeDir, "specs");
    this.runsDir = path.join(this.forgeDir, "runs");
    this.critiquesDir = path.join(this.forgeDir, "critiques");
    this.indexFile = path.join(this.forgeDir, "index.json");
    this.repoConfigFile = path.join(this.forgeDir, "repo-config.json");
    fs.mkdirSync(this.specsDir, { recursive: true });
    fs.mkdirSync(this.runsDir, { recursive: true });
    fs.mkdirSync(this.critiquesDir, { recursive: true });
  }

  /**
   * Lazy SQLite handle. Constructed on first access; migrations run
   * eagerly inside ForgeDb. Subcommands that touch the database go
   * through `store.db.db.prepare(...)`.
   */
  get db(): ForgeDb {
    if (!this.#db) {
      this.#db = new ForgeDb({ forgeDir: this.forgeDir });
    }
    return this.#db;
  }

  // ── Per-repo config (JIRA defaults, etc.) ───────────────────────────────

  private readRepoConfigFile(): RepoConfigFile {
    if (!fs.existsSync(this.repoConfigFile)) return { version: 1, repos: {} };
    try {
      return JSON.parse(fs.readFileSync(this.repoConfigFile, "utf-8")) as RepoConfigFile;
    } catch {
      return { version: 1, repos: {} };
    }
  }

  private writeRepoConfigFile(file: RepoConfigFile): void {
    atomicWriteJSON(this.repoConfigFile, file);
  }

  getRepoConfig(repoRoot: string): RepoConfig {
    return this.readRepoConfigFile().repos[repoRoot] ?? {};
  }

  setRepoConfig(repoRoot: string, patch: Partial<RepoConfig>): void {
    withFileLock(`${this.repoConfigFile}.lock`, () => {
      const file = this.readRepoConfigFile();
      file.repos[repoRoot] = { ...(file.repos[repoRoot] ?? {}), ...patch };
      this.writeRepoConfigFile(file);
    });
  }

  getWorkbenchRepos(): RegisteredWorkbenchRepo[] {
    const repos = this.readRepoConfigFile().workbench?.registeredRepos ?? {};
    return Object.values(repos).sort((a, b) => a.name.localeCompare(b.name) || a.root.localeCompare(b.root));
  }

  registerWorkbenchRepo(repo: { root: string; name: string }): RegisteredWorkbenchRepo {
    const record: RegisteredWorkbenchRepo = {
      root: repo.root,
      name: repo.name,
      addedAt: new Date().toISOString(),
    };
    withFileLock(`${this.repoConfigFile}.lock`, () => {
      const file = this.readRepoConfigFile();
      file.workbench ??= {};
      file.workbench.registeredRepos ??= {};
      file.workbench.registeredRepos[repo.root] = {
        ...(file.workbench.registeredRepos[repo.root] ?? {}),
        ...record,
      };
      this.writeRepoConfigFile(file);
    });
    return record;
  }

  readIndex(): ForgeIndex {
    if (!fs.existsSync(this.indexFile)) return { version: 1, plans: {} };
    try {
      // Pre-rename index files used `tasks` as the top-level map key. The
      // backfill reader accepts both shapes (see backfill.ts readPlansFromIndex);
      // mirror that here so the live reader doesn't silently lose every saved
      // plan on installs that haven't been re-written yet.
      const raw = JSON.parse(fs.readFileSync(this.indexFile, "utf-8")) as ForgeIndex & {
        tasks?: Record<string, Plan>;
      };
      const plans = raw.plans ?? raw.tasks ?? {};
      const index: ForgeIndex = { version: 1, plans };
      for (const p of Object.values(index.plans)) {
        if (typeof (p as Partial<Plan>).specVersion !== "number") {
          (p as Plan).specVersion = 1;
        }
        if (!("lastImproveError" in p)) {
          (p as Plan).lastImproveError = null;
        }
        if (!("archivedAt" in p)) {
          (p as Plan).archivedAt = null;
        }
      }
      return index;
    } catch {
      return { version: 1, plans: {} };
    }
  }

  writeIndex(index: ForgeIndex): void {
    atomicWriteJSON(this.indexFile, index);
  }

  getPlan(id: string): Plan | null {
    return this.readIndex().plans[id] ?? null;
  }

  upsertPlan(plan: Plan): void {
    withFileLock(`${this.indexFile}.lock`, () => {
      const index = this.readIndex();
      index.plans[plan.id] = plan;
      this.writeIndex(index);
    });
  }

  getPlans(repoRoot?: string): Plan[] {
    const all = Object.values(this.readIndex().plans);
    const plans = repoRoot ? all.filter((p) => p.repoRoot === repoRoot) : all;
    return plans.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  getRunningPlans(excludeRepo?: string): Plan[] {
    return Object.values(this.readIndex().plans).filter(
      (p) =>
        (p.status === "running" ||
          p.status === "quality_check" ||
          p.status === "creating_pr" ||
          p.status === "fixing") &&
        (!excludeRepo || p.repoRoot !== excludeRepo),
    );
  }

  getSpec(planId: string): string | null {
    const p = path.join(this.specsDir, `${planId}.md`);
    if (!fs.existsSync(p)) return null;
    return fs.readFileSync(p, "utf-8");
  }

  writeSpec(planId: string, content: string): string {
    const p = path.join(this.specsDir, `${planId}.md`);
    atomicWriteText(p, content);
    return p;
  }

  ensureRunDir(planId: string): string {
    const d = path.join(this.runsDir, planId);
    fs.mkdirSync(d, { recursive: true });
    return d;
  }

  getLogFile(planId: string): string {
    return path.join(this.runsDir, planId, "agent.log");
  }

  getRunnerScript(planId: string): string {
    return path.join(this.runsDir, planId, "run.sh");
  }

  getPromptFile(planId: string): string {
    return path.join(this.runsDir, planId, "prompt.txt");
  }

  readRunMeta(planId: string): Record<string, unknown> | null {
    const p = path.join(this.runsDir, planId, "meta.json");
    if (!fs.existsSync(p)) return null;
    try {
      return JSON.parse(fs.readFileSync(p, "utf-8"));
    } catch {
      return null;
    }
  }

  writeRunMeta(planId: string, meta: RunMeta): void {
    const p = path.join(this.runsDir, planId, "meta.json");
    atomicWriteJSON(p, meta);
  }

  /**
   * Merge a partial RunMeta patch into the existing file under a per-task
   * lock so concurrent writers (the bash runner script's set_status, plus
   * HTTP handlers like /api/plans/:id/kill) can't lose updates. Returns
   * the merged meta, or null if no meta exists yet.
   */
  mergeRunMeta(planId: string, patch: Partial<RunMeta>): RunMeta | null {
    const p = path.join(this.runsDir, planId, "meta.json");
    return withFileLock(`${p}.lock`, () => {
      if (!fs.existsSync(p)) return null;
      const current = JSON.parse(fs.readFileSync(p, "utf-8")) as RunMeta;
      const merged: RunMeta = { ...current, ...patch };
      atomicWriteJSON(p, merged);
      return merged;
    });
  }

  /** Read meta.json status and sync back to index if changed. Returns updated plan or null. */
  syncPlanStatus(plan: Plan): Plan | null {
    if (plan.status === "done" || plan.status === "failed" || plan.status === "draft" || plan.status === "archived")
      return null;
    const meta = this.readRunMeta(plan.id);
    if (!meta) return null;

    const newStatus = meta.status as PlanStatus | undefined;
    const prUrl = meta.prUrl as string | undefined;
    if (!newStatus || newStatus === plan.status) return null;

    const updated: Plan = {
      ...plan,
      status: newStatus,
      prUrl: prUrl ?? plan.prUrl,
      completedAt:
        newStatus === "done" || newStatus === "failed" || newStatus === "quality_failed"
          ? new Date().toISOString()
          : plan.completedAt,
    };
    this.upsertPlan(updated);

    // Phase 3 dual-write: keep the DB job row coherent with the bash
    // runner's meta.json transitions. Doesn't fail the sync if DB hiccups.
    try {
      syncJobState(this.db.db, updated, meta as Partial<RunMeta>);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      process.stderr.write(`warn: syncJobState failed for ${plan.id}: ${msg}\n`);
    }
    return updated;
  }

  generateId(title: string): string {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 36);
    const ts = Date.now().toString(36);
    return `${slug}-${ts}`;
  }

  /** Read the last N lines of a log file */
  tailLog(planId: string, lines = 8): string[] {
    const logFile = this.getLogFile(planId);
    if (!fs.existsSync(logFile)) return [];
    try {
      const content = fs.readFileSync(logFile, "utf-8");
      return content.split("\n").filter(Boolean).slice(-lines);
    } catch {
      return [];
    }
  }

  // ── Critique helpers ────────────────────────────────────────────────────────

  generateCritiqueId(): string {
    return `crit-${Date.now().toString(36)}`;
  }

  getCritiqueDir(planId: string, critiqueId: string): string {
    return path.join(this.critiquesDir, planId, critiqueId);
  }

  listCritiques(planId: string): string[] {
    const dir = path.join(this.critiquesDir, planId);
    if (!fs.existsSync(dir)) return [];
    try {
      return fs
        .readdirSync(dir, { withFileTypes: true })
        .filter((d) => d.isDirectory() && d.name.startsWith("crit-"))
        .map((d) => d.name)
        .sort((a, b) => b.localeCompare(a));
    } catch {
      return [];
    }
  }

  getLatestCritique(planId: string): string | null {
    const ids = this.listCritiques(planId);
    return ids[0] ?? null;
  }

  readCritiqueMeta(planId: string, critiqueId: string): CritiqueMeta | null {
    const p = path.join(this.getCritiqueDir(planId, critiqueId), "critique-meta.json");
    if (!fs.existsSync(p)) return null;
    try {
      return JSON.parse(fs.readFileSync(p, "utf-8")) as CritiqueMeta;
    } catch {
      return null;
    }
  }

  writeCritiqueMeta(planId: string, critiqueId: string, meta: CritiqueMeta): void {
    const dir = this.getCritiqueDir(planId, critiqueId);
    fs.mkdirSync(dir, { recursive: true });
    atomicWriteJSON(path.join(dir, "critique-meta.json"), meta);
  }

  markCritiqueViewed(planId: string, critiqueId: string): void {
    const meta = this.readCritiqueMeta(planId, critiqueId);
    if (!meta || meta.viewedAt) return;
    meta.viewedAt = new Date().toISOString();
    this.writeCritiqueMeta(planId, critiqueId, meta);
  }

  getRecommendationsFile(planId: string, critiqueId: string): string {
    return path.join(this.getCritiqueDir(planId, critiqueId), "recommendations.md");
  }

  getPendingCritiques(repoRoot?: string): Array<{ planId: string; critiqueId: string; meta: CritiqueMeta }> {
    const results: Array<{ planId: string; critiqueId: string; meta: CritiqueMeta }> = [];
    if (!fs.existsSync(this.critiquesDir)) return results;
    try {
      for (const planEntry of fs.readdirSync(this.critiquesDir, { withFileTypes: true })) {
        if (!planEntry.isDirectory()) continue;
        const planDir = path.join(this.critiquesDir, planEntry.name);
        for (const critEntry of fs.readdirSync(planDir, { withFileTypes: true })) {
          if (!critEntry.isDirectory() || !critEntry.name.startsWith("crit-")) continue;
          const metaPath = path.join(planDir, critEntry.name, "critique-meta.json");
          if (!fs.existsSync(metaPath)) continue;
          try {
            const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8")) as CritiqueMeta;
            const isPending =
              meta.status === "running_critics" ||
              meta.status === "running_synth" ||
              (meta.status === "done" && !meta.viewedAt) ||
              meta.status === "failed";
            if (!isPending) continue;
            if (repoRoot && meta.repoRoot !== repoRoot) continue;
            results.push({ planId: planEntry.name, critiqueId: critEntry.name, meta });
          } catch {
            /* corrupted meta — skip */
          }
        }
      }
    } catch {
      /* dir read error */
    }
    return results.sort((a, b) => b.meta.startedAt.localeCompare(a.meta.startedAt));
  }
}
