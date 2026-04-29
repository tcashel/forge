/**
 * Forge Store — global ~/.forge/ state management
 *
 * All specs and run metadata live at ~/.forge/ so they're accessible
 * from any repo. Each task references the repo it belongs to.
 */

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import type { Snapshot } from "./progress.js";

export type { Snapshot, ProgressEvent, Phase, Health, ToolActivity, UsageTotals, Alert, AlertKind } from "./progress.js";

export type TaskStatus =
  | "draft"
  | "running"
  | "quality_check"
  | "creating_pr"
  | "done"
  | "failed"
  | "quality_failed";

export type LaunchTarget = "pi" | "claude" | "codex";

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
export interface RepoConfig {
  jiraProject?: string;
  jiraType?: string;
}

export interface RepoConfigFile {
  version: 1;
  repos: Record<string, RepoConfig>;
}

export class ForgeStore {
  readonly forgeDir: string;
  readonly specsDir: string;
  readonly runsDir: string;
  readonly indexFile: string;

  readonly repoConfigFile: string;

  constructor() {
    this.forgeDir = path.join(os.homedir(), ".forge");
    this.specsDir = path.join(this.forgeDir, "specs");
    this.runsDir = path.join(this.forgeDir, "runs");
    this.indexFile = path.join(this.forgeDir, "index.json");
    this.repoConfigFile = path.join(this.forgeDir, "repo-config.json");
    fs.mkdirSync(this.specsDir, { recursive: true });
    fs.mkdirSync(this.runsDir, { recursive: true });
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
    fs.writeFileSync(this.repoConfigFile, JSON.stringify(file, null, 2) + "\n", "utf-8");
  }

  getRepoConfig(repoRoot: string): RepoConfig {
    return this.readRepoConfigFile().repos[repoRoot] ?? {};
  }

  setRepoConfig(repoRoot: string, patch: Partial<RepoConfig>): void {
    const file = this.readRepoConfigFile();
    file.repos[repoRoot] = { ...(file.repos[repoRoot] ?? {}), ...patch };
    this.writeRepoConfigFile(file);
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
    fs.writeFileSync(this.indexFile, JSON.stringify(index, null, 2) + "\n", "utf-8");
  }

  getTask(id: string): TaskRecord | null {
    return this.readIndex().tasks[id] ?? null;
  }

  upsertTask(task: TaskRecord): void {
    const index = this.readIndex();
    index.tasks[task.id] = task;
    this.writeIndex(index);
  }

  getTasks(repoRoot?: string): TaskRecord[] {
    const all = Object.values(this.readIndex().tasks);
    const tasks = repoRoot ? all.filter((t) => t.repoRoot === repoRoot) : all;
    return tasks.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  getRunningTasks(excludeRepo?: string): TaskRecord[] {
    return Object.values(this.readIndex().tasks).filter(
      (t) =>
        (t.status === "running" || t.status === "quality_check" || t.status === "creating_pr") &&
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
    fs.writeFileSync(p, content, "utf-8");
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

  writeRunMeta(taskId: string, meta: Record<string, unknown>): void {
    const p = path.join(this.runsDir, taskId, "meta.json");
    fs.writeFileSync(p, JSON.stringify(meta, null, 2) + "\n", "utf-8");
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

  // ── Snapshot helpers ──────────────────────────────────────────────────────

  getSnapshotFile(taskId: string): string {
    return path.join(this.runsDir, taskId, "snapshot.json");
  }

  getProgressFile(taskId: string): string {
    return path.join(this.runsDir, taskId, "progress.jsonl");
  }

  /** Returns null on missing file, parse error, or unsupported schemaVersion. Never throws. */
  readSnapshot(taskId: string): Snapshot | null {
    const p = this.getSnapshotFile(taskId);
    if (!fs.existsSync(p)) return null;
    try {
      const parsed = JSON.parse(fs.readFileSync(p, "utf-8"));
      if (parsed?.schemaVersion !== 1) return null;
      return parsed as Snapshot;
    } catch {
      return null;
    }
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
}
