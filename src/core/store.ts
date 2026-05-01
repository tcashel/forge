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
import { withFileLock } from "./file-lock.js";

export type TaskStatus =
  | "draft"
  | "running"
  | "quality_check"
  | "creating_pr"
  | "done"
  | "failed"
  | "quality_failed"
  | "fixing";

export type LaunchTarget = "claude" | "codex";

export interface TaskRecord {
  id: string;
  title: string;
  repoRoot: string;
  repoName: string;
  branch: string;
  worktree: string | null;
  status: TaskStatus;
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
}

export interface ForgeIndex {
  version: 1;
  tasks: Record<string, TaskRecord>;
}

/**
 * Per-repo configuration remembered between sessions. Keyed by absolute
 * repo root path. Currently used to remember the default JIRA project
 * and ticket type so we don't have to ask every save.
 */
export type ReasoningEffort = "low" | "medium" | "high" | "xhigh";

export type ReviewVerdict = "approve" | "request-changes" | "block";

export interface RunMeta {
  taskId: string;
  tmuxSession: string;
  logFile: string;
  agent: LaunchTarget;
  model: string;
  worktree: string;
  status: TaskStatus | "reviewing";
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
}

export interface RepoConfig {
  jiraProject?: string;
  jiraType?: string;
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
  // ── GitHub CLI overrides ────────────────────────────────────────────────
  /** gh account to use for this repo (e.g. "tcashelmgni"). Falls back to gh's active account. */
  ghUser?: string;
  /** gh hostname (e.g. "github.com" or an Enterprise host). Falls back to github.com. */
  ghHost?: string;
}

export interface RepoConfigFile {
  version: 1;
  repos: Record<string, RepoConfig>;
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
  taskId: string;
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

export class ForgeStore {
  readonly forgeDir: string;
  readonly specsDir: string;
  readonly runsDir: string;
  readonly critiquesDir: string;
  readonly indexFile: string;

  readonly repoConfigFile: string;

  constructor() {
    this.forgeDir = path.join(os.homedir(), ".forge");
    this.specsDir = path.join(this.forgeDir, "specs");
    this.runsDir = path.join(this.forgeDir, "runs");
    this.critiquesDir = path.join(this.forgeDir, "critiques");
    this.indexFile = path.join(this.forgeDir, "index.json");
    this.repoConfigFile = path.join(this.forgeDir, "repo-config.json");
    fs.mkdirSync(this.specsDir, { recursive: true });
    fs.mkdirSync(this.runsDir, { recursive: true });
    fs.mkdirSync(this.critiquesDir, { recursive: true });
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

  readIndex(): ForgeIndex {
    if (!fs.existsSync(this.indexFile)) return { version: 1, tasks: {} };
    try {
      return JSON.parse(fs.readFileSync(this.indexFile, "utf-8")) as ForgeIndex;
    } catch {
      return { version: 1, tasks: {} };
    }
  }

  writeIndex(index: ForgeIndex): void {
    atomicWriteJSON(this.indexFile, index);
  }

  getTask(id: string): TaskRecord | null {
    return this.readIndex().tasks[id] ?? null;
  }

  upsertTask(task: TaskRecord): void {
    withFileLock(`${this.indexFile}.lock`, () => {
      const index = this.readIndex();
      index.tasks[task.id] = task;
      this.writeIndex(index);
    });
  }

  getTasks(repoRoot?: string): TaskRecord[] {
    const all = Object.values(this.readIndex().tasks);
    const tasks = repoRoot ? all.filter((t) => t.repoRoot === repoRoot) : all;
    return tasks.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  getRunningTasks(excludeRepo?: string): TaskRecord[] {
    return Object.values(this.readIndex().tasks).filter(
      (t) =>
        (t.status === "running" ||
          t.status === "quality_check" ||
          t.status === "creating_pr" ||
          t.status === "fixing") &&
        (!excludeRepo || t.repoRoot !== excludeRepo),
    );
  }

  getSpec(taskId: string): string | null {
    const p = path.join(this.specsDir, `${taskId}.md`);
    if (!fs.existsSync(p)) return null;
    return fs.readFileSync(p, "utf-8");
  }

  writeSpec(taskId: string, content: string): string {
    const p = path.join(this.specsDir, `${taskId}.md`);
    atomicWriteText(p, content);
    return p;
  }

  ensureRunDir(taskId: string): string {
    const d = path.join(this.runsDir, taskId);
    fs.mkdirSync(d, { recursive: true });
    return d;
  }

  getLogFile(taskId: string): string {
    return path.join(this.runsDir, taskId, "agent.log");
  }

  getRunnerScript(taskId: string): string {
    return path.join(this.runsDir, taskId, "run.sh");
  }

  getPromptFile(taskId: string): string {
    return path.join(this.runsDir, taskId, "prompt.txt");
  }

  readRunMeta(taskId: string): Record<string, unknown> | null {
    const p = path.join(this.runsDir, taskId, "meta.json");
    if (!fs.existsSync(p)) return null;
    try {
      return JSON.parse(fs.readFileSync(p, "utf-8"));
    } catch {
      return null;
    }
  }

  writeRunMeta(taskId: string, meta: RunMeta): void {
    const p = path.join(this.runsDir, taskId, "meta.json");
    atomicWriteJSON(p, meta);
  }

  /** Read meta.json status and sync back to index if changed. Returns updated task or null. */
  syncTaskStatus(task: TaskRecord): TaskRecord | null {
    if (task.status === "done" || task.status === "failed" || task.status === "draft") return null;
    const meta = this.readRunMeta(task.id);
    if (!meta) return null;

    const newStatus = meta.status as TaskStatus | undefined;
    const prUrl = meta.prUrl as string | undefined;
    if (!newStatus || newStatus === task.status) return null;

    const updated: TaskRecord = {
      ...task,
      status: newStatus,
      prUrl: prUrl ?? task.prUrl,
      completedAt:
        newStatus === "done" || newStatus === "failed" || newStatus === "quality_failed"
          ? new Date().toISOString()
          : task.completedAt,
    };
    this.upsertTask(updated);
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
  tailLog(taskId: string, lines = 8): string[] {
    const logFile = this.getLogFile(taskId);
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

  getCritiqueDir(taskId: string, critiqueId: string): string {
    return path.join(this.critiquesDir, taskId, critiqueId);
  }

  listCritiques(taskId: string): string[] {
    const dir = path.join(this.critiquesDir, taskId);
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

  getLatestCritique(taskId: string): string | null {
    const ids = this.listCritiques(taskId);
    return ids[0] ?? null;
  }

  readCritiqueMeta(taskId: string, critiqueId: string): CritiqueMeta | null {
    const p = path.join(this.getCritiqueDir(taskId, critiqueId), "critique-meta.json");
    if (!fs.existsSync(p)) return null;
    try {
      return JSON.parse(fs.readFileSync(p, "utf-8")) as CritiqueMeta;
    } catch {
      return null;
    }
  }

  writeCritiqueMeta(taskId: string, critiqueId: string, meta: CritiqueMeta): void {
    const dir = this.getCritiqueDir(taskId, critiqueId);
    fs.mkdirSync(dir, { recursive: true });
    atomicWriteJSON(path.join(dir, "critique-meta.json"), meta);
  }

  markCritiqueViewed(taskId: string, critiqueId: string): void {
    const meta = this.readCritiqueMeta(taskId, critiqueId);
    if (!meta || meta.viewedAt) return;
    meta.viewedAt = new Date().toISOString();
    this.writeCritiqueMeta(taskId, critiqueId, meta);
  }

  getRecommendationsFile(taskId: string, critiqueId: string): string {
    return path.join(this.getCritiqueDir(taskId, critiqueId), "recommendations.md");
  }

  getPendingCritiques(repoRoot?: string): Array<{ taskId: string; critiqueId: string; meta: CritiqueMeta }> {
    const results: Array<{ taskId: string; critiqueId: string; meta: CritiqueMeta }> = [];
    if (!fs.existsSync(this.critiquesDir)) return results;
    try {
      for (const taskEntry of fs.readdirSync(this.critiquesDir, { withFileTypes: true })) {
        if (!taskEntry.isDirectory()) continue;
        const taskDir = path.join(this.critiquesDir, taskEntry.name);
        for (const critEntry of fs.readdirSync(taskDir, { withFileTypes: true })) {
          if (!critEntry.isDirectory() || !critEntry.name.startsWith("crit-")) continue;
          const metaPath = path.join(taskDir, critEntry.name, "critique-meta.json");
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
            results.push({ taskId: taskEntry.name, critiqueId: critEntry.name, meta });
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
